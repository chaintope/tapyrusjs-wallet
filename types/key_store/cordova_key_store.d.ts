import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';
export default class CordovaKeyStore implements KeyStore {
    private network;
    constructor(network: tapyrus.networks.Network);
    addPrivateKey(wif: string): Promise<void>;
    addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
    private get;
    private set;
    private remove;
}
