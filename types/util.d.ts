import { Balance } from './balance';
import { Utxo } from './utxo';
export declare function keyToScript(keys: string[], colorId?: string): string[];
export declare function sumBalance(utxos: Utxo[], colorId?: string): Balance;
export declare function belongsToPrivateKeys(keys: string[], privateKey: Buffer | undefined): boolean;
