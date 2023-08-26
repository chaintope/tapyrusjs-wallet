import * as tapyrus from 'tapyrusjs-lib';
import * as assert from 'assert';
import { describe, it } from 'mocha';

import MemoryKeyStore from '../src/key_store/memory_key_store';

describe('MemoryKeyStore', () => {
  describe('addPrivateKey', () => {
    const keyStore = new MemoryKeyStore(tapyrus.networks.prod);
    const priv = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';
    it('add key to storage', async () => {
      await keyStore.addPrivateKey(priv);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        'dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15',
      ]);
    });
  });
  describe('addExtendedPrivateKey', () => {
    const keyStore = new MemoryKeyStore(tapyrus.networks.prod);
    const xpriv =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('add key to storage', async () => {
      await keyStore.addExtendedPrivateKey(xpriv);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        'dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15',
      ]);
    });
  });
  describe('clear', () => {
    const keyStore = new MemoryKeyStore(tapyrus.networks.prod);
    const priv = 'L4aywsjiFjDw9pqon2GDQtomfk36gx2xdUtoU28aaey8KJwUHder';
    it('add key to storage', async () => {
      await keyStore.addPrivateKey(priv);
      await keyStore.clear();
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, []);
    });
  });
});
