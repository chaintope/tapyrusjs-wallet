import CordovaKeyStore from './key_store/cordova_key_store';
import MemoryKeyStore from './key_store/memory_key_store';
import ReactKeyStore from './key_store/react_key_store';
export { CordovaKeyStore, MemoryKeyStore, ReactKeyStore };
export interface KeyStore {
    addPrivateKey(wif: string): Promise<void>;
    addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
    keys(): Promise<string[]>;
}
