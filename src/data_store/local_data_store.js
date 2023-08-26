'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const memory_data_store_1 = require('./memory_data_store');
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
class LocalDataStore extends memory_data_store_1.default {
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
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = [];
      localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
    });
  }
  add(utxos) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = this.utxos.concat(utxos);
      if (this.utxos.length > this._limit) {
        throw Error(
          `Limit over error. Utxo items count was over ${this._limit}.`,
        );
      }
      localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
    });
  }
}
exports.default = LocalDataStore;
