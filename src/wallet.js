'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const bip32 = require('bip32');
const tapyrus = require('tapyrusjs-lib');
class BaseWallet {
  constructor(keyStore, dataStore, config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
  }
  import(key) {
    const restored = bip32.fromBase58(key, this.config.network);
    this.keyStore.add(restored.privateKey);
  }
  importWif(wif) {
    const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
    this.keyStore.add(keyPair.privateKey);
  }
}
exports.BaseWallet = BaseWallet;
