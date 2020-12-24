'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class Utxo {
  constructor(txid, height, index, scriptPubkey, colorId, value) {
    this.txid = txid;
    this.height = height;
    this.index = index;
    this.scriptPubkey = scriptPubkey;
    this.colorId = colorId;
    this.value = value;
  }
}
exports.Utxo = Utxo;
