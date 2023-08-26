import { Utxo } from '../utxo';
import MemoryDataStore from './memory_data_store';
/**
 * LocalDataStore
 *
 * This DataStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpful for keep data on browser.
 *
 * NOTE:
 *   Browser Local Storage has store limit that is 10 MB. Therefore,
 *   This class only stored until 5,120 items at default.
 *   This limit can be changed with constructor params.
 */
export default class LocalDataStore extends MemoryDataStore {
    _limit: number;
    /**
     * Constructor: Load previous data.
     */
    constructor(limit?: number);
    clear(): Promise<void>;
    add(utxos: Utxo[]): Promise<void>;
}
