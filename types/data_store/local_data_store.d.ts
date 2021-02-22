import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from '../balance';
import { DataStore } from '../data_store';
import { Utxo } from '../utxo';
export default class LocalDataStore implements DataStore {
    utxos: Utxo[];
    clear(): Promise<void>;
    add(utxos: Utxo[]): Promise<void>;
    all(): Promise<Utxo[]>;
    utxosFor(keys: string[], colorId?: string): Promise<Utxo[]>;
    balanceFor(keys: string[], colorId?: string): Promise<Balance>;
    processTx(_keys: string[], _tx: tapyrus.Transaction): Promise<void>;
}
