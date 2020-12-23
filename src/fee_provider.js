'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class FixedFeeProvider {
  constructor(fixedFee) {
    this.fixedFee = fixedFee;
  }
  fee(_tx) {
    return this.fixedFee;
  }
}
exports.FixedFeeProvider = FixedFeeProvider;
class SizeBasedFeeProvider {
  constructor(feeParBytes) {
    this.feeParByte = feeParBytes || SizeBasedFeeProvider.DEFAULT_FEE_PAR_BYTE;
  }
  fee(tx) {
    return this.feeParByte * tx.byteLength(false, false);
  }
}
SizeBasedFeeProvider.DEFAULT_FEE_PAR_BYTE = 10;
exports.SizeBasedFeeProvider = SizeBasedFeeProvider;
