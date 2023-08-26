'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const tapyrus = require('tapyrusjs-lib');
/**
 * MemoryKeyStore
 *
 * This KeyStore is very simple store that save any data in flush memory.
 */
class MemoryKeyStore {
  constructor(network) {
    this._wifKeys = [];
    this._extKeys = [];
    this.network = network;
  }
  addPrivateKey(key) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._wifKeys.push(key);
    });
  }
  addExtendedPrivateKey(extendedPrivateKey) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._extKeys.push(extendedPrivateKey);
    });
  }
  keys() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return this._wifKeys
        .map(wif => {
          return tapyrus.ECPair.fromWIF(wif, this.network).privateKey.toString(
            'hex',
          );
        })
        .concat(
          this._extKeys.map(xpriv => {
            return tapyrus.bip32
              .fromBase58(xpriv, this.network)
              .privateKey.toString('hex');
          }),
        );
    });
  }
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      this._wifKeys = [];
      this._extKeys = [];
    });
  }
}
exports.default = MemoryKeyStore;
