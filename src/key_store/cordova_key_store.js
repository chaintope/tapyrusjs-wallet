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
class CordovaKeyStore {
  constructor(network) {
    this.network = network;
  }
  addPrivateKey(wif) {
    return __awaiter(this, void 0, void 0, function*() {
      yield this.get('tapyrus/wallet/key/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            yield this.set(`tapyrus/wallet/key/${count}`, wif);
            yield this.set(`tapyrus/wallet/key/count`, (count + 1).toString());
          }),
        )
        .catch(reason =>
          __awaiter(this, void 0, void 0, function*() {
            //first import
            try {
              if (JSON.parse(reason).code == 1) {
                yield this.set(`tapyrus/wallet/key/0`, wif);
                yield this.set(`tapyrus/wallet/key/count`, '1');
              }
            } catch (e) {
              console.log(e);
            }
          }),
        );
    });
  }
  addExtendedPrivateKey(extendedPrivateKey) {
    return __awaiter(this, void 0, void 0, function*() {
      yield this.get('tapyrus/wallet/ext/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            yield this.set(`tapyrus/wallet/ext/${count}`, extendedPrivateKey);
            yield this.set(`tapyrus/wallet/ext/count`, (count + 1).toString());
          }),
        )
        .catch(reason =>
          __awaiter(this, void 0, void 0, function*() {
            //first import
            if (JSON.parse(reason).code == 1) {
              yield this.set(`tapyrus/wallet/ext/0`, extendedPrivateKey);
              yield this.set(`tapyrus/wallet/ext/count`, '1');
            }
          }),
        );
    });
  }
  keys() {
    return __awaiter(this, void 0, void 0, function*() {
      const privKeys = yield this.get('tapyrus/wallet/key/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            const keys = [];
            for (let i = 0; i < count; i++) {
              const wif = yield this.get(`tapyrus/wallet/key/${i}`);
              const key = tapyrus.ECPair.fromWIF(
                wif,
                this.network,
              ).privateKey.toString('hex');
              keys.push(key);
            }
            return keys;
          }),
        )
        .catch(_ => {
          return [];
        });
      const extKeys = yield this.get('tapyrus/wallet/ext/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            const keys = [];
            for (let i = 0; i < count; i++) {
              const xpriv = yield this.get(`tapyrus/wallet/ext/${i}`);
              const key = tapyrus.bip32
                .fromBase58(xpriv, this.network)
                .privateKey.toString('hex');
              keys.push(key);
            }
            return keys;
          }),
        )
        .catch(_ => {
          return [];
        });
      return privKeys.concat(extKeys);
    });
  }
  clear() {
    return __awaiter(this, void 0, void 0, function*() {
      yield this.get('tapyrus/wallet/key/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            for (let i = 0; i < count; i++) {
              yield this.remove(`tapyrus/wallet/key/${i}`);
            }
            yield this.remove('tapyrus/wallet/key/count');
            return;
          }),
        )
        .catch(e => {
          console.log(e);
        });
      yield this.get('tapyrus/wallet/ext/count')
        .then(value =>
          __awaiter(this, void 0, void 0, function*() {
            const count = Number(value);
            for (let i = 0; i < count; i++) {
              yield this.remove(`tapyrus/wallet/ext/${i}`);
            }
            yield this.remove('tapyrus/wallet/ext/count');
            return;
          }),
        )
        .catch(e => {
          console.log(e);
        });
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
  remove(key) {
    return __awaiter(this, void 0, void 0, function*() {
      return new Promise((resolve, reject) => {
        cordova.plugins.SecureKeyStore.remove(resolve, reject, key);
      });
    });
  }
}
exports.default = CordovaKeyStore;
