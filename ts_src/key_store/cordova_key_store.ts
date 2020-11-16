import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';

declare let cordova: any;

export class CordovaKeyStore implements KeyStore {
  addPrivateKey(key: Buffer): void {
    this.get('tapyrus/wallet/key/count').then(count => {
      this.set(`tapyrus/wallet/key/${count}`, key.toString('hex'));
      this.set(`tapyrus/wallet/key/count`, count + 1);
    });
  }

  addExtendedPrivateKey(
    extendedPrivateKey: tapyrus.bip32.BIP32Interface,
  ): void {
    this.get('tapyrus/wallet/ext/count').then(count => {
      this.set(
        `tapyrus/wallet/ext/${count}`,
        JSON.stringify(extendedPrivateKey),
      );
      this.set(`tapyrus/wallet/ext/count`, count + 1);
    });
  }

  private async get(key: string): Promise<string> {
    return new Promise(
      (resolve, reject): void => {
        cordova.plugins.SecureKeyStore.get(resolve, reject, key);
      },
    );
  }
  private async set(key: string, value: string): Promise<string> {
    return new Promise(
      (resolve, reject): void => {
        cordova.plugins.SecureKeyStore.set(resolve, reject, key, value);
      },
    );
  }
}
