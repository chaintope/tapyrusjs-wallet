'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
class TransferParams {
  constructor(colorId, amount, toAddress) {
    this.colorId = colorId;
    this.amount = amount;
    this.toAddress = toAddress;
  }
}
exports.TransferParams = TransferParams;
exports.TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
function createDummyTransaction(txb) {
  const dummyTx = tapyrus.Transaction.fromBuffer(
    txb.buildIncomplete().toBuffer(),
  );
  dummyTx.addInput(
    Buffer.from(
      '0000000000000000000000000000000000000000000000000000000000000000',
      'hex',
    ),
    0,
    0,
    Buffer.from(
      '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      'hex',
    ),
  );
  dummyTx.addOutput(
    Buffer.from('76a914000000000000000000000000000000000000000088ac', 'hex'),
    0,
  );
  return dummyTx;
}
exports.createDummyTransaction = createDummyTransaction;
