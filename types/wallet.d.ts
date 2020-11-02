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
    constructor(keyStore: KeyStore, dataStore: DataStore);
    import(key: string): void;
    importWif(wif: string): void;
}
