'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const memory_key_store_1 = require('./memory_key_store');
const WIF_KEYS_STORE_KEY = 'wifKeys';
const EXT_KEYS_STORE_KEY = 'extKeys';
const DEFAULT_KEYS_LIMIT = 5120;
/**
 * LocalKeyStore
 *
 * This KeyStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpful for keep data on browser.
 *
 * NOTE:
 *   Browser Local Storage has store limit that is 10 MB. Therefore,
 *   This class only stored until 5,120 items at default.
 *   This limit can be changed with constructor params.
 */
class LocalKeyStore extends memory_key_store_1.default {
  constructor(network, limit = DEFAULT_KEYS_LIMIT) {
    super(network);
    this._limit = limit;
    const wifKeysJson = localStorage.getItem(WIF_KEYS_STORE_KEY) || '[]';
    const extKeysJson = localStorage.getItem(EXT_KEYS_STORE_KEY) || '[]';
    this._wifKeys = JSON.parse(wifKeysJson);
    this._extKeys = JSON.parse(extKeysJson);
  }
  addPrivateKey(key) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._wifKeys.push(key);
      this.checkLimit();
      localStorage.setItem(WIF_KEYS_STORE_KEY, JSON.stringify(this._wifKeys));
    });
  }
  addExtendedPrivateKey(extendedPrivateKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._extKeys.push(extendedPrivateKey);
      this.checkLimit();
      localStorage.setItem(EXT_KEYS_STORE_KEY, JSON.stringify(this._extKeys));
    });
  }
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._wifKeys = [];
      this._extKeys = [];
      localStorage.setItem(WIF_KEYS_STORE_KEY, JSON.stringify(this._wifKeys));
      localStorage.setItem(EXT_KEYS_STORE_KEY, JSON.stringify(this._extKeys));
    });
  }
  checkLimit() {
    if (this._wifKeys.length + this._extKeys.length > this._limit) {
      throw Error(`Limit over error. Key items count was over ${this._limit}.`);
    }
  }
}
exports.default = LocalKeyStore;
