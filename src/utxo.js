'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
class Utxo {
  constructor(txid, height, index, scriptPubkey, colorId, value) {
    this.txid = txid;
    this.height = height;
    this.index = index;
    this.scriptPubkey = scriptPubkey;
    this.colorId = colorId;
    this.value = value;
  }
  address() {
    return tapyrus.address.fromOutputScript(
      Buffer.from(this.scriptPubkey, 'hex'),
    );
  }
}
exports.Utxo = Utxo;
