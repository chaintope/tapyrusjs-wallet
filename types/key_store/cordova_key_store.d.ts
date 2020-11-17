import { KeyStore } from '../key_store';
export declare class CordovaKeyStore implements KeyStore {
    addPrivateKey(wif: string): void;
    addExtendedPrivateKey(extendedPrivateKey: string): void;
    private get;
    private set;
}
