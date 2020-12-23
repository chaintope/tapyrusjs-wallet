import * as tapyrus from 'tapyrusjs-lib';
export interface FeeProvider {
    fee(tx: tapyrus.Transaction): number;
}
export declare class FixedFeeProvider implements FeeProvider {
    fixedFee: number;
    constructor(fixedFee: number);
    fee(_tx: tapyrus.Transaction): number;
}
export declare class SizeBasedFeeProvider implements FeeProvider {
    static DEFAULT_FEE_PAR_BYTE: number;
    feeParByte: number;
    constructor(feeParBytes?: number);
    fee(tx: tapyrus.Transaction): number;
}
