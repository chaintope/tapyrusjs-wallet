'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const bip32 = require('bip32');
const tapyrus = require('tapyrusjs-lib');
class BaseWallet {
  constructor(keyStore, dataStore) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
  }
  import(key) {
    const restored = bip32.fromBase58(key);
    this.keyStore.add(restored.privateKey);
  }
  importWif(wif) {
    const keyPair = tapyrus.ECPair.fromWIF(wif);
    this.keyStore.add(keyPair.privateKey);
  }
}
exports.BaseWallet = BaseWallet;
