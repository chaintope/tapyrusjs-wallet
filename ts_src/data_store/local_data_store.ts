import { Utxo } from '../utxo';
import MockDataStore from './mock_data_store';

const UTXOS_STORE_KEY = 'utxos';

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
  constructor() {
    super();
    const utxosJson = localStorage.getItem(UTXOS_STORE_KEY);
    if (utxosJson) {
      this.utxos = JSON.parse(utxosJson);
    }
  }

  async clear(): Promise<void> {
    this.utxos = [];
    localStorage.clear();
  }

  async add(utxos: Utxo[]): Promise<void> {
    this.utxos = this.utxos.concat(utxos);
    localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
  }
}
