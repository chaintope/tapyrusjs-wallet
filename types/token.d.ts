import * as tapyrus from 'tapyrusjs-lib';
export declare class TransferParams {
    colorId: string;
    amount: number;
    toAddress: string;
    constructor(colorId: string, amount: number, toAddress: string);
}
export declare const TokenTypes: {
    REISSUBALE: number;
    NON_REISSUABLE: number;
    NFT: number;
};
export declare function createDummyTransaction(txb: tapyrus.TransactionBuilder): tapyrus.Transaction;
