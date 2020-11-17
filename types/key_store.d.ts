export interface KeyStore {
    addPrivateKey(wif: string): void;
    addExtendedPrivateKey(extendedPrivateKey: string): void;
    keys(): Promise<string[]>;
}
