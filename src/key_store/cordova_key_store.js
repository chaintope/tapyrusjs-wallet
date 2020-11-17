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
class CordovaKeyStore {
  addPrivateKey(wif) {
    this.get('tapyrus/wallet/key/count').then(count => {
      this.set(`tapyrus/wallet/key/${count}`, wif);
      this.set(`tapyrus/wallet/key/count`, (count + 1).toString());
    });
  }
  addExtendedPrivateKey(extendedPrivateKey) {
    this.get('tapyrus/wallet/ext/count').then(count => {
      this.set(`tapyrus/wallet/ext/${count}`, extendedPrivateKey);
      this.set(`tapyrus/wallet/ext/count`, (count + 1).toString());
    });
  }
  get(key) {
    return __awaiter(this, void 0, void 0, function*() {
      return new Promise((resolve, reject) => {
        cordova.plugins.SecureKeyStore.get(resolve, reject, key);
      });
    });
  }
  set(key, value) {
    return __awaiter(this, void 0, void 0, function*() {
      return new Promise((resolve, reject) => {
        cordova.plugins.SecureKeyStore.set(resolve, reject, key, value);
      });
    });
  }
}
exports.CordovaKeyStore = CordovaKeyStore;
