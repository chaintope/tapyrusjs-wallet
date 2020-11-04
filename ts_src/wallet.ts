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

  // Synchonize utxos with index server.
  update(): Promise<void>;

  // Broadcast Transaction
  // broadcast(tx: tapyrus.Transaction): Promise<string>;

  // Return amount for the specified colorId
  balance(colorId?: string): Promise<Balance>;
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
    const keys = await this.keyStore.keys();
    if (util.belongsToPrivateKeys(keys, restored.privateKey)) {
      return;
    }
    this.keyStore.addExtendedPrivateKey(xpriv);
  }

  async importWif(wif: string): Promise<void> {
    const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
    const keys = await this.keyStore.keys();
    if (util.belongsToPrivateKeys(keys, keyPair.privateKey)) {
      return;
    }
    this.keyStore.addPrivateKey(wif);
  }

  async update(): Promise<void> {
    const keys = await this.keyStore.keys();
    return Promise.all(keys.map(key => this.listUnspent(key)))
      .then(utxos => utxos.flat())
      .then((utxos: Utxo[]) => {
        this.dataStore.clear().then(() => this.dataStore.add(utxos));
      });
  }

  // async broadcast(_tx: tapyrus.Transaction): Promise<string> {
  //   throw Error('Not Implemented');
  // }

  async balance(colorId?: string): Promise<Balance> {
    const keys = await this.keyStore.keys();
    return this.dataStore.balanceFor(keys, colorId);
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
