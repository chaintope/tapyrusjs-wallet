import { Balance } from './balance';
import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
import { Rpc } from './rpc';
export default interface Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    importExtendedPrivateKey(key: string): Promise<void>;
    importWif(wif: string): Promise<void>;
    update(): Promise<void>;
    balance(colorId?: string): Promise<Balance>;
}
export declare class BaseWallet implements Wallet {
    static COLOR_ID_FOR_TPC: string;
    keyStore: KeyStore;
    dataStore: DataStore;
    config: Config;
    rpc: Rpc;
    constructor(keyStore: KeyStore, dataStore: DataStore, config: Config);
    importExtendedPrivateKey(xpriv: string): Promise<void>;
    importWif(wif: string): Promise<void>;
    update(): Promise<void>;
    balance(colorId?: string): Promise<Balance>;
    private listUnspent;
    private privateToScriptHash;
}
