import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from './balance';
import { Config } from './config';
import { DataStore } from './data_store';
import { KeyStore } from './key_store';
import { Rpc } from './rpc';
import { TransferParams } from './token';
import { Utxo } from './utxo';
export interface BroadcastOptions {
    headers?: {
        [key: string]: string;
    };
    params?: any[];
}
export declare type TransferOptions = BroadcastOptions;
export default interface Wallet {
    keyStore: KeyStore;
    dataStore: DataStore;
    importExtendedPrivateKey(key: string): Promise<void>;
    importWif(wif: string): Promise<void>;
    update(): Promise<void>;
    broadcast(tx: tapyrus.Transaction, options?: BroadcastOptions): Promise<string>;
    balance(colorId?: string): Promise<Balance>;
    utxos(colorId?: string): Promise<Utxo[]>;
    estimatedFee(tx: tapyrus.Transaction): number;
    transfer(params: TransferParams[], changePubkeyScript: Buffer, options?: TransferOptions): Promise<tapyrus.Transaction>;
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
    broadcast(tx: tapyrus.Transaction, options?: BroadcastOptions): Promise<string>;
    balance(colorId?: string): Promise<Balance>;
    utxos(colorId?: string): Promise<Utxo[]>;
    transfer(params: TransferParams[], changePubkeyScript: Buffer, options?: TransferOptions): Promise<tapyrus.Transaction>;
    estimatedFee(tx: tapyrus.Transaction): number;
    private listUnspent;
    private privateToScriptHash;
    private addressToOutput;
    private collect;
}
export declare class HDWallet extends BaseWallet {
    static DerivePath: string;
    _mnemonic: string;
    _rootNode?: tapyrus.BIP32Interface;
    addresses: string[];
    constructor(config: Config, mnemonic?: string, dataStore?: DataStore, keyStore?: KeyStore);
    init(): Promise<void>;
    mnemonic(): string;
    generateAddress(): string;
}
