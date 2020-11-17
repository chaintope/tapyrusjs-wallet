'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class BaseWallet {
  constructor(keyStore, dataStore, config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
  }
  importExtendedPrivateKey(xpriv) {
    this.keyStore.addExtendedPrivateKey(xpriv);
  }
  importWif(wif) {
    this.keyStore.addPrivateKey(wif);
  }
}
exports.BaseWallet = BaseWallet;
