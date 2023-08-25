'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const memory_data_store_1 = require('./memory_data_store');
const UTXOS_STORE_KEY = 'utxos';
/**
 * LocalDataStore
 *
 * This DataStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpfull for keep data on browser.
 */
class LocalDataStore extends memory_data_store_1.default {
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
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = [];
      localStorage.clear();
    });
  }
  add(utxos) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = this.utxos.concat(utxos);
      localStorage.setItem(UTXOS_STORE_KEY, JSON.stringify(this.utxos));
    });
  }
}
exports.default = LocalDataStore;
