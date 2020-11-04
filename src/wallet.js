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
class BaseWallet {
  constructor(keyStore, dataStore, config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
  }
  importExtendedPrivateKey(xpriv) {
    return __awaiter(this, void 0, void 0, function*() {
      tapyrus.bip32.fromBase58(xpriv, this.config.network);
      this.keyStore.addExtendedPrivateKey(xpriv);
    });
  }
  importWif(wif) {
    return __awaiter(this, void 0, void 0, function*() {
      tapyrus.ECPair.fromWIF(wif, this.config.network);
      this.keyStore.addPrivateKey(wif);
    });
  }
}
exports.BaseWallet = BaseWallet;
