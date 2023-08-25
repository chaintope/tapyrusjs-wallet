import { Utxo } from '../utxo';
import MockDataStore from './mock_data_store';
/**
 * LocalDataStore
 *
 * This DataStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpfull for keep data on browser.
 */
export default class LocalDataStore extends MockDataStore {
    /**
     * Constructor: Load previous data.
     */
    constructor();
    clear(): Promise<void>;
    add(utxos: Utxo[]): Promise<void>;
}
