import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';
export default class LocalKeyStore implements KeyStore {
    _wifKeys: string[];
    _extKeys: string[];
    network: tapyrus.networks.Network;
    constructor(network: tapyrus.networks.Network);
    addPrivateKey(key: string): Promise<void>;
    addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
    keys(): Promise<string[]>;
    clear(): Promise<void>;
}
