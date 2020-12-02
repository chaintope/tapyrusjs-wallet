import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';
export interface Token {
    transfer(wallet: Wallet, toAddress: string, amount: number, changePubkeyScript: Buffer): Promise<{
        txb: tapyrus.TransactionBuilder;
        inputs: Utxo[];
    }>;
}
export declare class TokenParams {
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
export declare class BaseToken {
    transfer(wallet: Wallet, params: TokenParams[], changePubkeyScript: Buffer): Promise<{
        txb: tapyrus.TransactionBuilder;
        inputs: Utxo[];
    }>;
    private addressToOutput;
    private collect;
    private transferTxSize;
}
