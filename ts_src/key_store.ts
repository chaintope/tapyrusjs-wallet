import * as tapyrus from 'tapyrusjs-lib';

export interface KeyStore {
  addPrivateKey(key: Buffer): void;
  addExtendedPrivateKey(extendedPrivateKey: tapyrus.bip32.BIP32Interface): void;
}
