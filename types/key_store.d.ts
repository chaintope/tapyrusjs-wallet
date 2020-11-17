export interface KeyStore {
    addPrivateKey(wif: string): void;
    addExtendedPrivateKey(extendedPrivateKey: string): void;
}
