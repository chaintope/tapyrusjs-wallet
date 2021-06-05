import CordovaKeyStore from './key_store/cordova_key_store';
import LocalKeyStore from './key_store/local_key_store';
import ReactKeyStore from './key_store/react_key_store';
export { CordovaKeyStore, LocalKeyStore, ReactKeyStore };
export interface KeyStore {
  addPrivateKey(wif: string): Promise<void>;
  addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
  keys(): Promise<string[]>;
}
