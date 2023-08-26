'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const util = require('../util');
/**
 * MemoryDataStore
 *
 * This DataStore is very simple store that save any data in flush memory.
 */
class MemoryDataStore {
  constructor() {
    this.utxos = [];
  }
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = [];
    });
  }
  add(utxos) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this.utxos = this.utxos.concat(utxos);
    });
  }
  all() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return this.utxos;
    });
  }
  utxosFor(keys, colorId) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      return this.utxos.filter(utxo => {
        return scripts.find(script => script === utxo.scriptPubkey);
      });
    });
  }
  balanceFor(keys, colorId) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const utxos = yield this.utxosFor(keys, colorId);
      return util.sumBalance(utxos, colorId);
    });
  }
  processTx(_keys, _tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return;
    });
  }
}
exports.default = MemoryDataStore;
