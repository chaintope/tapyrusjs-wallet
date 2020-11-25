import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from './balance';
import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
import { Rpc } from './rpc';
import * as util from './util';
import { Utxo } from './utxo';

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
  broadcast(tx: tapyrus.Transaction): Promise<string>;

  // Return amount for the specified colorId
  balance(colorId?: string): Promise<Balance>;

  // Return utxos associated with colorId(if colorId is not specified, return uncolored utxos)
  utxos(colorId?: string): Promise<Utxo[]>;

  // Calculate fee for transaction
  estimatedFee(txSize: number): number;
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

  async broadcast(tx: tapyrus.Transaction): Promise<string> {
    const response: any = await this.rpc
      .request(this.config, 'blockchain.transaction.broadcast', [tx.toHex()])
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

  estimatedFee(txSize: number): number {
    return txSize * this.config.feePerByte;
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
}
