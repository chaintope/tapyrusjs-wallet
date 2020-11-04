import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
export default interface Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    importExtendedPrivateKey(key: string): Promise<void>;
    importWif(wif: string): Promise<void>;
}
export declare class BaseWallet implements Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    config: Config;
    constructor(keyStore: KeyStore, dataStore: DataStore, config: Config);
    importExtendedPrivateKey(xpriv: string): Promise<void>;
    importWif(wif: string): Promise<void>;
}
