import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';
export declare class CordovaKeyStore implements KeyStore {
    addPrivateKey(key: Buffer): void;
    addExtendedPrivateKey(extendedPrivateKey: tapyrus.bip32.BIP32Interface): void;
    private get;
    private set;
}
