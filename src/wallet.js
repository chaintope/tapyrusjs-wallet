'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
class BaseWallet {
  constructor(keyStore, dataStore, config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
  }
  importExtendedPrivateKey(xpriv) {
    tapyrus.bip32.fromBase58(xpriv, this.config.network);
    this.keyStore.addExtendedPrivateKey(xpriv);
  }
  importWif(wif) {
    tapyrus.ECPair.fromWIF(wif, this.config.network);
    this.keyStore.addPrivateKey(wif);
  }
}
exports.BaseWallet = BaseWallet;
