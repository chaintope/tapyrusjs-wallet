'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
class LocalKeyStore {
  constructor(network) {
    this._wifKeys = [];
    this._extKeys = [];
    this.network = network;
  }
  addPrivateKey(key) {
    return __awaiter(this, void 0, void 0, function*() {
      this._wifKeys.push(key);
    });
  }
  addExtendedPrivateKey(extendedPrivateKey) {
    return __awaiter(this, void 0, void 0, function*() {
      this._extKeys.push(extendedPrivateKey);
    });
  }
  keys() {
    return __awaiter(this, void 0, void 0, function*() {
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
    return __awaiter(this, void 0, void 0, function*() {
      this._wifKeys = [];
      this._extKeys = [];
    });
  }
}
exports.default = LocalKeyStore;
