import { KeyStore } from '../key_store';
export declare class CordovaKeyStore implements KeyStore {
    add(key: Buffer): void;
    private get;
    private set;
}
