import * as tapyrus from 'tapyrusjs-lib';
import MemoryKeyStore from './memory_key_store';
/**
 * LocalKeyStore
 *
 * This KeyStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpful for keep data on browser.
 *
 * NOTE:
 *   Browser Local Storage has store limit that is 10 MB. Therefore,
 *   This class only stored until 5,120 items at default.
 *   This limit can be changed with constructor params.
 */
export default class LocalKeyStore extends MemoryKeyStore {
    _limit: number;
    constructor(network: tapyrus.networks.Network, limit?: number);
    addPrivateKey(key: string): Promise<void>;
    addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
    clear(): Promise<void>;
    private checkLimit;
}
