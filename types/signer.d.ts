import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';
export declare class SignOptions {
    network?: tapyrus.Network;
}
export declare function sign(wallet: Wallet, txb: tapyrus.TransactionBuilder, utxos: Utxo[], options?: SignOptions): Promise<tapyrus.TransactionBuilder>;
export declare function keyForScript(wallet: Wallet, script: string, options?: SignOptions): Promise<tapyrus.ECPair.ECPairInterface | undefined>;
export declare function outputToPubkeyHash(output: Buffer): Buffer;
