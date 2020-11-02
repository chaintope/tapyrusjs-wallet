import * as assert from 'assert';
import { describe, it } from 'mocha';

import * as wallet from '../src/wallet';
import { KeyStore } from '../src/key_store';
import { DataStore } from '../src/data_store';

class LocalKeyStore implements KeyStore {
  keys: Buffer[] = [];

  add(key: Buffer) {
    this.keys.push(key);
  }

  clear() {
    this.keys = [];
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

describe('wallet', () => {
  const keyStore = new LocalKeyStore();
  const alice = new wallet.BaseWallet(keyStore, new LocalDataStore());

  afterEach(() => {
    keyStore.clear();
  });

  describe('import', () => {
    const xpriv =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('add key to storage', () => {
      alice.import(xpriv);
      assert.deepStrictEqual(
        keyStore.keys.map((value: Buffer) => {
          return value.toString('hex');
        }),
        ['dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15'],
      );
    });
  });

  describe('importWif', () => {
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    it('add key to storage', () => {
      alice.importWif(wif);
      assert.deepStrictEqual(
        keyStore.keys.map((value: Buffer) => {
          return value.toString('hex');
        }),
        ['5bff37ef1fa65b660d26d28f65b06781e6576d3787a50df61a24ec2f22127fb5'],
      );
    });
  });
});
