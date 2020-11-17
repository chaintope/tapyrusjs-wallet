import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';
export declare class CordovaKeyStore implements KeyStore {
    private network;
    constructor(network: tapyrus.networks.Network);
    addPrivateKey(wif: string): void;
    addExtendedPrivateKey(extendedPrivateKey: string): void;
    keys(): Promise<string[]>;
    private get;
    private set;
}
