import { Utxo } from '../utxo';
import MemoryDataStore from './memory_data_store';

const UTXOS_STORE_KEY = 'utxos';
const DEFAULT_UTXOS_LIMIT = 5120;

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
  constructor(limit = DEFAULT_UTXOS_LIMIT) {
    super();
    this._limit = limit;
    const utxosJson = localStorage.getItem(UTXOS_STORE_KEY);
    if (utxosJson) {
      this.utxos = JSON.parse(utxosJson);
    }
  }

  async clear(): Promise<void> {
    this.utxos = [];
    localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
  }

  async add(utxos: Utxo[]): Promise<void> {
    this.utxos = this.utxos.concat(utxos);
    if (this.utxos.length > this._limit) {
      throw Error(
        `Limit over error. Utxo items count was over ${this._limit}.`,
      );
    }
    localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
  }
}
