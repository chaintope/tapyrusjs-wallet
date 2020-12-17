export declare class Utxo {
    txid: string;
    height: number;
    index: number;
    value: number;
    scriptPubkey: string;
    colorId: string;
    constructor(txid: string, height: number, index: number, scriptPubkey: string, colorId: string, value: number);
    type(): string;
}
