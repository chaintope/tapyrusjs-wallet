import CordovaKeyStore from './key_store/cordova_key_store';
import LocalKeyStore from './key_store/local_key_store';
export { CordovaKeyStore, LocalKeyStore };
export interface KeyStore {
  addPrivateKey(wif: string): Promise<void>;
  addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
  keys(): Promise<string[]>;
}
