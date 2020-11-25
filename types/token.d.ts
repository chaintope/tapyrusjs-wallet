import * as tapyrus from 'tapyrusjs-lib';
import Wallet from './wallet';
export interface Token {
    transfer(wallet: Wallet, toAddress: string, amount: number): Promise<tapyrus.Transaction>;
}
export declare const TokenTypes: {
    REISSUBALE: number;
    NON_REISSUABLE: number;
    NFT: number;
};
export declare class BaseToken {
    colorId: string;
    constructor(colorId: string);
    transfer(wallet: Wallet, toAddress: string, amount: number): Promise<tapyrus.Transaction>;
    private keyForScript;
    private outputToPayment;
    private addressToOutput;
    private collect;
    private transferTxSize;
}
