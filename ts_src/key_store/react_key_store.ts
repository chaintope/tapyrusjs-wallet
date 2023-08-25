import * as SecureStore from 'expo-secure-store';
import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';

export default class ReactKeyStore implements KeyStore {
  network: tapyrus.networks.Network;

  constructor(network: tapyrus.networks.Network) {
    this.network = network;
  }

  async addPrivateKey(wif: string): Promise<void> {
    await this.get('tapyrus.wallet.key.count')
      .then(async value => {
        const count = Number(value);
        await this.set(`tapyrus.wallet.key.${count}`, wif);
        await this.set(`tapyrus.wallet.key.count`, (count + 1).toString());
      })
      .catch(async _reason => {
        // first import
        try {
          await this.set(`tapyrus.wallet.key.0`, wif);
          await this.set(`tapyrus.wallet.key.count`, '1');
        } catch (e) {
          console.log(e);
        }
      });
  }

  async addExtendedPrivateKey(extendedPrivateKey: string): Promise<void> {
    await this.get('tapyrus.wallet.ext.count')
      .then(async value => {
        const count = Number(value);
        await this.set(`tapyrus.wallet.ext.${count}`, extendedPrivateKey);
        await this.set(`tapyrus.wallet.ext.count`, (count + 1).toString());
      })
      .catch(async _reason => {
        // first import
        await this.set(`tapyrus.wallet.ext.0`, extendedPrivateKey);
        await this.set(`tapyrus.wallet.ext.count`, '1');
      });
  }

  async keys(): Promise<string[]> {
    const privKeys: string[] = await this.get('tapyrus.wallet.key.count')
      .then(async value => {
        const count = Number(value);
        const keys: string[] = [];
        for (let i = 0; i < count; i++) {
          const wif = (await this.get(`tapyrus.wallet.key.${i}`)) || '';
          const key = tapyrus.ECPair.fromWIF(
            wif,
            this.network,
          ).privateKey!.toString('hex');
          keys.push(key);
        }
        return keys;
      })
      .catch(_ => {
        return [];
      });
    const extKeys: string[] = await this.get('tapyrus.wallet.ext.count')
      .then(async value => {
        const count = Number(value);
        const keys: string[] = [];

        for (let i = 0; i < count; i++) {
          const xpriv = (await this.get(`tapyrus.wallet.ext.${i}`)) || '';
          const key = tapyrus.bip32
            .fromBase58(xpriv, this.network)
            .privateKey!.toString('hex');
          keys.push(key);
        }
        return keys;
      })
      .catch(_ => {
        return [];
      });
    return privKeys.concat(extKeys);
  }

  async clear(): Promise<void> {
    await this.get('tapyrus.wallet.key.count')
      .then(async value => {
        const count = Number(value);

        for (let i = 0; i < count; i++) {
          await this.remove(`tapyrus.wallet.key.${i}`);
        }
        await this.remove('tapyrus.wallet.key.count');
        return;
      })
      .catch(e => {
        console.log(e);
      });
    await this.get('tapyrus.wallet.ext.count')
      .then(async value => {
        const count = Number(value);

        for (let i = 0; i < count; i++) {
          await this.remove(`tapyrus.wallet.ext.${i}`);
        }
        await this.remove('tapyrus.wallet.ext.count');
        return;
      })
      .catch(e => {
        console.log(e);
      });
  }

  private async get(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  private async set(key: string, value: string): Promise<void> {
    return SecureStore.setItemAsync(key, value);
  }

  private async remove(key: string): Promise<void> {
    return SecureStore.deleteItemAsync(key);
  }
}
