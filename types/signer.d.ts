import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';
export declare function sign(wallet: Wallet, txb: tapyrus.TransactionBuilder, utxos: Utxo[]): Promise<tapyrus.TransactionBuilder>;
export declare function keyForScript(wallet: Wallet, script: string): Promise<tapyrus.ECPair.ECPairInterface>;
export declare function outputToPubkeyHash(output: Buffer): Buffer;
