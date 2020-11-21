import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as tapyrus from 'tapyrusjs-lib';

import { Config } from '../src/config';
import { BaseWallet } from '../src/wallet';
import { KeyStore } from '../src/key_store';
import { DataStore } from '../src/data_store';

class LocalKeyStore implements KeyStore {
  _wifKeys: string[] = [];
  _extKeys: string[] = [];
  network: tapyrus.networks.Network;

  constructor(network: tapyrus.networks.Network) {
    this.network = network;
  }

  addPrivateKey(key: string) {
    this._wifKeys.push(key);
  }

  addExtendedPrivateKey(extendedPrivateKey: string) {
    this._extKeys.push(extendedPrivateKey);
  }

  async keys(): Promise<string[]> {
    return this._wifKeys
      .map(wif => {
        return tapyrus.ECPair.fromWIF(wif, this.network).privateKey!.toString(
          'hex',
        );
      })
      .concat(
        this._extKeys.map(xpriv => {
          return tapyrus.bip32
            .fromBase58(xpriv, this.network)
            .privateKey!.toString('hex');
        }),
      );
  }

  clear() {
    this._wifKeys = [];
    this._extKeys = [];
  }
}

class LocalDataStore implements DataStore {
  data: { [key: string]: any } = {};

  set(key: string, value: any): void {
    this.data[key] = value;
  }
  get(key: string): any {
    return this.data[key];
  }
}

const createWallet = (
  network: string,
): {
  wallet: BaseWallet;
  keyStore: LocalKeyStore;
  dataStore: LocalDataStore;
} => {
  const config = new Config({
    host: 'example.org',
    port: '50001',
    path: '/',
    network,
  });
  const keyStore = new LocalKeyStore(config.network);
  const dataStore = new LocalDataStore();
  const wallet = new BaseWallet(keyStore, dataStore, config);
  return {
    wallet,
    keyStore,
    dataStore,
  };
};

describe('wallet', () => {
  describe('importExtendedPrivateKey', () => {
    const { wallet: alice, keyStore } = createWallet('prod');
    const xpriv =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('add key to storage', async () => {
      alice.importExtendedPrivateKey(xpriv);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        'dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15',
      ]);
    });

    context('in dev mode', () => {
      const { wallet: alice, keyStore } = createWallet('dev');
      const xpriv =
        'tprv8ZgxMBicQKsPeqL5kfoFJ8pSjCAeYnqZuKpzgCFmenmr24wM3AiLx1sgUetKLEQmPq6Vn9K44ZEDDuFx1LydXu8dyXPtUz1p1L85ZZoMUFK';
      it('add key to storage', async () => {
        alice.importExtendedPrivateKey(xpriv);
        const keys = await keyStore.keys();
        assert.deepStrictEqual(keys, [
          '30433e1ec20bdcf86495de605d223e8b044425b50705c04af6191a85cd7c457f',
        ]);
      });
    });

    context('invalid network version', () => {
      const { wallet: alice } = createWallet('prod');
      const xpriv =
        'tprv8ZgxMBicQKsPeqL5kfoFJ8pSjCAeYnqZuKpzgCFmenmr24wM3AiLx1sgUetKLEQmPq6Vn9K44ZEDDuFx1LydXu8dyXPtUz1p1L85ZZoMUFK';
      it('throw exception', async () => {
        assert.throws(() => {
          alice.importExtendedPrivateKey(xpriv);
        }, new TypeError('Invalid network version'));
      });
    });

    context('invalid format', () => {
      const { wallet: alice } = createWallet('prod');
      const xpriv =
        '8ZgxMBicQKsPeqL5kfoFJ8pSjCAeYnqZuKpzgCFmenmr24wM3AiLx1sgUetKLEQmPq6Vn9K44ZEDDuFx1LydXu8dyXPtUz1p1L85ZZoMUFK';
      it('throw exception', async () => {
        assert.throws(() => {
          alice.importExtendedPrivateKey(xpriv);
        }, new Error('Invalid checksum'));
      });
    });
  });

  describe('importWif', () => {
    const { wallet: alice, keyStore } = createWallet('prod');
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    it('add key to storage', async () => {
      alice.importWif(wif);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        '5bff37ef1fa65b660d26d28f65b06781e6576d3787a50df61a24ec2f22127fb5',
      ]);
    });

    context('in dev mode', () => {
      const { wallet: alice, keyStore } = createWallet('dev');
      const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('add key to storage', async () => {
        alice.importWif(wif);
        const keys = await keyStore.keys();
        assert.deepStrictEqual(keys, [
          '5bff37ef1fa65b660d26d28f65b06781e6576d3787a50df61a24ec2f22127fb5',
        ]);
      });
    });

    context('invalid network version', () => {
      const { wallet: alice } = createWallet('prod');
      const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('throw exception', async () => {
        assert.throws(() => {
          alice.importWif(wif);
        }, new Error('Invalid network version'));
      });
    });

    context('invalid format', () => {
      const { wallet: alice } = createWallet('prod');
      const wif = 'xQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('throw exception', async () => {
        assert.throws(() => {
          alice.importWif(wif);
        }, new Error('Invalid checksum'));
      });
    });
  });
});
