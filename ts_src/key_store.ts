export interface KeyStore {
  addPrivateKey(wif: string): Promise<void>;
  addExtendedPrivateKey(extendedPrivateKey: string): Promise<void>;
  keys(): Promise<string[]>;
}
