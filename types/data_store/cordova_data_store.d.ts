import { Balance } from '../balance';
import { DataStore } from '../data_store';
import { Utxo } from '../utxo';
export default class CordovaDataStore implements DataStore {
    database: any;
    constructor();
    add(utxos: Utxo[]): Promise<void>;
    remove(txid: Buffer, index: number): Promise<void>;
    clear(): Promise<void>;
    balanceFor(keys: string[], colorId?: string): Promise<Balance>;
}
