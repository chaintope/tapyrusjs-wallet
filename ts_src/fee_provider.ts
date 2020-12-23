import * as tapyrus from 'tapyrusjs-lib';

export interface FeeProvider {
  fee(tx: tapyrus.Transaction): number;
}

export class FixedFeeProvider implements FeeProvider {
  fixedFee: number;
  constructor(fixedFee: number) {
    this.fixedFee = fixedFee;
  }
  fee(_tx: tapyrus.Transaction): number {
    return this.fixedFee;
  }
}

export class SizeBasedFeeProvider implements FeeProvider {
  static DEFAULT_FEE_PAR_BYTE = 10;
  feeParByte: number;

  constructor(feeParBytes?: number) {
    this.feeParByte = feeParBytes || SizeBasedFeeProvider.DEFAULT_FEE_PAR_BYTE;
  }

  fee(tx: tapyrus.Transaction): number {
    return this.feeParByte * tx.byteLength(false, false);
  }
}
