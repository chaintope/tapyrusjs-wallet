import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
export default interface Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    import(key: string): void;
    importWif(wif: string): void;
}
export declare class BaseWallet implements Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    config: Config;
    constructor(keyStore: KeyStore, dataStore: DataStore, config: Config);
    import(key: string): void;
    importWif(wif: string): void;
}
