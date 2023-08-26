import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as tapyrus from 'tapyrusjs-lib';

import LocalKeyStore from '../src/key_store/local_key_store';

describe('LocalKeyStore', () => {
  describe('load from localStorage at instantiation', () => {
    const priv = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';

    beforeEach(() => {
      // store previouse datas.
      localStorage.setItem('wifKeys', JSON.stringify([priv]));
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('New instance should have one wif key.', async () => {
      const keyStore = new LocalKeyStore(tapyrus.networks.prod);
      assert.strictEqual((await keyStore.keys()).length, 1);
    });
  });
  describe('addPrivateKey', () => {
    const keyStore = new LocalKeyStore(tapyrus.networks.prod);
    const priv = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';
    it('add key to storage', async () => {
      await keyStore.addPrivateKey(priv);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        'dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15',
      ]);
      assert.strictEqual(
        localStorage.getItem('wifKeys'),
        '["L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder"]',
      );
    });
  });
  describe('addExtendedPrivateKey', () => {
    const keyStore = new LocalKeyStore(tapyrus.networks.prod);
    const xpriv =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('add key to storage', async () => {
      await keyStore.addExtendedPrivateKey(xpriv);
      assert.strictEqual(
        localStorage.getItem('extKeys'),
        '["xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe"]',
      );
    });
  });
  describe('clear', () => {
    const keyStore = new LocalKeyStore(tapyrus.networks.prod);
    const priv = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';
    it('add key to storage', async () => {
      await keyStore.addPrivateKey(priv);
      await keyStore.clear();
      assert.strictEqual(localStorage.getItem('wifKeys'), '[]');
    });
  });
  describe('limit check', () => {
    const keyStore = new LocalKeyStore(tapyrus.networks.prod, 1);
    const priv1 = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';
    const xpriv1 =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('should throw error key count is over limit.', async () => {
      await keyStore.addPrivateKey(priv1);
      return keyStore
        .addExtendedPrivateKey(xpriv1)
        .then(
          () => assert.fail('must throw error.'),
          (err: Error) =>
            assert.strictEqual(
              err.message,
              'Limit over error. Key items count was over 1.',
            ),
        );
    });
  });
});
