'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const wallet_1 = require('./wallet');
class Utxo {
  constructor(txid, height, index, scriptPubkey, colorId, value) {
    this.txid = txid;
    this.height = height;
    this.index = index;
    this.scriptPubkey = scriptPubkey;
    this.colorId = colorId;
    this.value = value;
  }
  type() {
    if (this.colorId !== wallet_1.BaseWallet.COLOR_ID_FOR_TPC) {
      return 'cp2pkh';
    } else {
      return 'p2pkh';
    }
  }
}
exports.Utxo = Utxo;
