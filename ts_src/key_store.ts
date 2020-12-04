import CordovaKeyStore from './key_store/cordova_key_store';
export { CordovaKeyStore };
export interface KeyStore {
  addPrivateKey(wif: string): Promise<void>;
  addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
  keys(): Promise<string[]>;
}
