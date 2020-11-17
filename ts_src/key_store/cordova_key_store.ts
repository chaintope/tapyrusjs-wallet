import { KeyStore } from '../key_store';

declare let cordova: any;

export class CordovaKeyStore implements KeyStore {
  addPrivateKey(wif: string): void {
    this.get('tapyrus/wallet/key/count').then(count => {
      this.set(`tapyrus/wallet/key/${count}`, wif);
      this.set(`tapyrus/wallet/key/count`, (count + 1).toString());
    });
  }

  addExtendedPrivateKey(extendedPrivateKey: string): void {
    this.get('tapyrus/wallet/ext/count').then(count => {
      this.set(`tapyrus/wallet/ext/${count}`, extendedPrivateKey);
      this.set(`tapyrus/wallet/ext/count`, (count + 1).toString());
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
