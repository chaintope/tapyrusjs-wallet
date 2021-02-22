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
const util = require('../util');
class LocalDataStore {
  constructor() {
    this.utxos = [];
  }
  clear() {
    return __awaiter(this, void 0, void 0, function*() {
      this.utxos = [];
    });
  }
  add(utxos) {
    return __awaiter(this, void 0, void 0, function*() {
      this.utxos = this.utxos.concat(utxos);
    });
  }
  all() {
    return __awaiter(this, void 0, void 0, function*() {
      return this.utxos;
    });
  }
  utxosFor(keys, colorId) {
    return __awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      return this.utxos.filter(utxo => {
        return scripts.find(script => script === utxo.scriptPubkey);
      });
    });
  }
  balanceFor(keys, colorId) {
    return __awaiter(this, void 0, void 0, function*() {
      const utxos = yield this.utxosFor(keys, colorId);
      return util.sumBalance(utxos, colorId);
    });
  }
  processTx(_keys, _tx) {
    return __awaiter(this, void 0, void 0, function*() {
      return;
    });
  }
}
exports.default = LocalDataStore;
