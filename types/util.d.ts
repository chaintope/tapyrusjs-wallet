/// <reference types="node" />
import { Balance } from './balance';
import { KeyStore } from './key_store';
import { Utxo } from './utxo';
export declare function keyToScript(keys: string[], colorId?: string): string[];
export declare function sumBalance(utxos: Utxo[], colorId?: string): Balance;
export declare function belongsToPrivateKeys(keyStore: KeyStore, privateKey: Buffer | undefined): Promise<boolean>;
