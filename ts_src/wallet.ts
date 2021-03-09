import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from './balance';
import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
import { Rpc } from './rpc';
import { sign } from './signer';
import { createDummyTransaction, TransferParams } from './token';
import * as util from './util';
import { Utxo } from './utxo';

export interface BroadcastOptions {
  headers?: { [key: string]: string };
  params?: any[];
}
export type TransferOptions = BroadcastOptions;

export default interface Wallet {
  keyStore: KeyStore;
  dataStore: DataStore;

  // Import private key into this wallet.
  importExtendedPrivateKey(key: string): Promise<void>;

  // Import WIF format private key into this wallet.
  importWif(wif: string): Promise<void>;

  // Synchronize utxos with index server.
  update(): Promise<void>;

  // Broadcast Transaction
  broadcast(
    tx: tapyrus.Transaction,
    options?: BroadcastOptions,
  ): Promise<string>;

  // Return amount for the specified colorId
  balance(colorId?: string): Promise<Balance>;

  // Return utxos associated with colorId(if colorId is not specified, return uncolored utxos)
  utxos(colorId?: string): Promise<Utxo[]>;

  // Calculate fee for transaction
  estimatedFee(tx: tapyrus.Transaction): number;

  // Send token
  transfer(
    params: TransferParams[],
    changePubkeyScript: Buffer,
    options?: TransferOptions,
  ): Promise<tapyrus.Transaction>;
}

// Wallet Implementation
export class BaseWallet implements Wallet {
  static COLOR_ID_FOR_TPC =
    '000000000000000000000000000000000000000000000000000000000000000000';
  keyStore: KeyStore;
  dataStore: DataStore;
  config: Config;
  rpc: Rpc;

  constructor(keyStore: KeyStore, dataStore: DataStore, config: Config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
    this.rpc = new Rpc();
  }

  async importExtendedPrivateKey(xpriv: string): Promise<void> {
    const restored = tapyrus.bip32.fromBase58(xpriv, this.config.network);
    const result = await util.belongsToPrivateKeys(
      this.keyStore,
      restored.privateKey,
    );
    if (result) {
      return;
    }
    return this.keyStore.addExtendedPrivateKey(xpriv);
  }

  async importWif(wif: string): Promise<void> {
    const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
    const result = await util.belongsToPrivateKeys(
      this.keyStore,
      keyPair.privateKey,
    );
    if (result) {
      return;
    }
    return this.keyStore.addPrivateKey(wif);
  }

  async update(): Promise<void> {
    const keys = await this.keyStore.keys();
    return Promise.all(
      keys.map(key => this.listUnspent(key).catch((_r: any): Utxo[] => [])),
    )
      .then(utxos => utxos.reduce((acc, val) => acc.concat(val), []))
      .then((utxos: Utxo[]) => {
        this.dataStore.clear().then(() => this.dataStore.add(utxos));
      });
  }

  async broadcast(
    tx: tapyrus.Transaction,
    options?: BroadcastOptions,
  ): Promise<string> {
    const response: any = await this.rpc
      .request(
        this.config,
        'blockchain.transaction.broadcast',
        [tx.toHex()].concat((options || {}).params || []),
        (options || {}).headers,
      )
      .catch((reason: any) => {
        throw new Error(reason);
      });
    const keys = await this.keyStore.keys();
    await this.dataStore.processTx(keys, tx);
    return response.toString();
  }

  async balance(colorId?: string): Promise<Balance> {
    const keys = await this.keyStore.keys();
    return this.dataStore.balanceFor(keys, colorId);
  }

  async utxos(colorId?: string): Promise<Utxo[]> {
    const keys = await this.keyStore.keys();
    return this.dataStore.utxosFor(keys, colorId);
  }

  async transfer(
    params: TransferParams[],
    changePubkeyScript: Buffer,
    options?: TransferOptions,
  ): Promise<tapyrus.Transaction> {
    const txb = new tapyrus.TransactionBuilder();
    txb.setVersion(1);

    const inputs: Utxo[] = [];
    const uncoloredScript = tapyrus.payments.p2pkh({
      output: changePubkeyScript,
      network: this.config.network,
    });

    for (const param of params) {
      const coloredUtxos = await this.utxos(param.colorId);
      const { sum: sumToken, collected: tokens } = this.collect(
        coloredUtxos,
        param.amount,
      );
      const coloredScript: Buffer = this.addressToOutput(
        param.toAddress,
        Buffer.from(param.colorId, 'hex'),
        this.config.network,
      );

      const changeColoredScript: Buffer = tapyrus.payments.cp2pkh({
        hash: uncoloredScript.hash,
        colorId: Buffer.from(param.colorId, 'hex'),
        network: this.config.network,
      }).output!;
      tokens.map((utxo: Utxo) => {
        txb.addInput(
          utxo.txid,
          utxo.index,
          undefined,
          Buffer.from(utxo.scriptPubkey, 'hex'),
        );
        inputs.push(utxo);
      });
      txb.addOutput(coloredScript, param.amount);
      txb.addOutput(changeColoredScript, sumToken - param.amount);
    }

    const uncoloredUtxos = await this.utxos();
    const fee = this.estimatedFee(createDummyTransaction(txb));
    const { sum: sumTpc, collected: tpcs } = this.collect(uncoloredUtxos, fee);
    tpcs.map((utxo: Utxo) => {
      txb.addInput(
        utxo.txid,
        utxo.index,
        undefined,
        Buffer.from(utxo.scriptPubkey, 'hex'),
      );
      inputs.push(utxo);
    });
    txb.addOutput(uncoloredScript.output!, sumTpc - fee);
    const signedTxb = await sign(this, txb, inputs);
    const tx = signedTxb.build();
    await this.broadcast(tx, options);
    return tx;
  }

  estimatedFee(tx: tapyrus.Transaction): number {
    return this.config.feeProvider.fee(tx);
  }

  private async listUnspent(key: string): Promise<Utxo[]> {
    const [p2pkh, scripthash] = this.privateToScriptHash(
      Buffer.from(key, 'hex'),
    );

    const response: any[] = await this.rpc.request(
      this.config,
      'blockchain.scripthash.listunspent',
      [Buffer.from(scripthash).toString('hex')],
    );
    return response.map(r => {
      if (r.color_id) {
        const cp2pkh = tapyrus.payments.cp2pkh({
          pubkey: p2pkh.pubkey,
          colorId: Buffer.from(r.color_id, 'hex'),
          network: this.config.network,
        });
        return new Utxo(
          r.tx_hash,
          r.height,
          r.tx_pos,
          cp2pkh.output!.toString('hex'),
          r.color_id,
          r.value,
        );
      } else {
        return new Utxo(
          r.tx_hash,
          r.height,
          r.tx_pos,
          p2pkh.output!.toString('hex'),
          BaseWallet.COLOR_ID_FOR_TPC,
          r.value,
        );
      }
    });
  }

  // convert private key to scripthash
  private privateToScriptHash(
    key: Buffer,
  ): [tapyrus.payments.Payment, Uint8Array] {
    const pair = tapyrus.ECPair.fromPrivateKey(key);
    const p2pkh = tapyrus.payments.p2pkh({
      pubkey: pair.publicKey,
    });
    return [p2pkh, tapyrus.crypto.sha256(p2pkh.output!).reverse()];
  }

  // convert address to buffer of scriptPubkey
  private addressToOutput(
    address: string,
    colorId: Buffer | undefined,
    network?: tapyrus.Network,
  ): Buffer {
    if (colorId) {
      try {
        return tapyrus.payments.cp2pkh({ address, network }).output!;
      } catch (e) {}
      try {
        const hash = tapyrus.payments.p2pkh({ address, network }).hash!;
        return tapyrus.payments.cp2pkh({ hash, colorId, network }).output!;
      } catch (e) {}
    } else {
      try {
        return tapyrus.payments.p2pkh({ address, network }).output!;
      } catch (e) {}
    }
    throw new Error('Invalid address type.');
  }

  private collect(
    utxos: Utxo[],
    amount: number,
  ): { sum: number; collected: Utxo[] } {
    let sum = 0;
    const collected: Utxo[] = [];
    for (const utxo of utxos) {
      sum += utxo.value;
      collected.push(utxo);
      if (sum >= amount) {
        break;
      }
    }
    if (sum >= amount) {
      return { sum, collected };
    } else {
      throw new Error('Insufficient Token');
    }
  }
}
