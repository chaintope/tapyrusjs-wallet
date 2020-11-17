import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';

declare let cordova: any;

export class CordovaKeyStore implements KeyStore {
  private network: tapyrus.networks.Network;

  constructor(network: tapyrus.networks.Network) {
    this.network = network;
  }

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

  async keys(): Promise<string[]> {
    const privKeys = await this.get('tapyrus/wallet/key/count').then(
      async value => {
        const count = Number(value);
        const keys: string[] = [];
        for (let i = 0; i < count; i++) {
          const wif = await this.get(`tapyrus/wallet/key/${i}`);
          const key = tapyrus.ECPair.fromWIF(
            wif,
            this.network,
          ).privateKey!.toString('hex');
          keys.push(key);
        }
        return keys;
      },
    );
    const extKeys = await this.get('tapyrus/wallet/ext/count').then(
      async value => {
        const count = Number(value);
        const keys: string[] = [];

        for (let i = 0; i < count; i++) {
          const xpriv = await this.get(`tapyrus/wallet/ext/${i}`);
          const key = tapyrus.bip32
            .fromBase58(xpriv, this.network)
            .privateKey!.toString('hex');
          keys.push(key);
        }
        return keys;
      },
    );
    return privKeys.concat(extKeys);
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
