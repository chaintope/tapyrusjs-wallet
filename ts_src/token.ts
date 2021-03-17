import * as tapyrus from 'tapyrusjs-lib';
import { BaseWallet } from './wallet';
export class TransferParams {
  colorId: string;
  amount: number;
  toAddress: string;

  constructor(
    colorId: string = BaseWallet.COLOR_ID_FOR_TPC,
    amount: number,
    toAddress: string,
  ) {
    this.colorId = colorId;
    this.amount = amount;
    this.toAddress = toAddress;
  }
}

export const TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
type TokenTypes = typeof TokenTypes[keyof typeof TokenTypes];

export function createDummyTransaction(
  txb: tapyrus.TransactionBuilder,
): tapyrus.Transaction {
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
