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
  importExtendedPrivateKey(key) {
    const restored = bip32.fromBase58(key, this.config.network);
    this.keyStore.addExtendedPrivateKey(restored);
  }
  importWif(wif) {
    const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
    this.keyStore.addPrivateKey(keyPair.privateKey);
  }
}
exports.BaseWallet = BaseWallet;
