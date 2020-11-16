import * as bip32 from 'bip32';
import * as tapyrus from 'tapyrusjs-lib';
import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';

export default interface Wallet {
  keyStore: KeyStore;
  dataStore: DataStore;

  // Import private key into this wallet.
  import(key: string): void;

  // Import WIF format private key into this wallet.
  importWif(wif: string): void;

  // Synchonize utxos with index server.
  // update(): Promise<void>;

  // Broadcast Transaction
  // broadcast(tx: tapyrus.Transaction): Promise<string>;

  // Return amount for the specified colorId
  // balance(colorId?: string): number;
}

export class BaseWallet implements Wallet {
  keyStore: KeyStore;
  dataStore: DataStore;
  config: Config;

  constructor(keyStore: KeyStore, dataStore: DataStore, config: Config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
  }

  import(key: string): void {
    const restored = bip32.fromBase58(key, this.config.network);
    this.keyStore.add(restored.privateKey!);
  }

  importWif(wif: string): void {
    const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
    this.keyStore.add(keyPair.privateKey!);
  }

  // async update(): Promise<void> {
  //   throw Error('Not Implemented');
  // }

  // async broadcast(_tx: tapyrus.Transaction): Promise<string> {
  //   throw Error('Not Implemented');
  // }

  // balance(_colorId?: string): number {
  //   throw Error('Not Implemented');
  // }
}
