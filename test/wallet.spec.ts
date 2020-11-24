import * as assert from 'assert';
import { describe, it } from 'mocha';

import { Utxo } from '../src/utxo';
import * as tapyrus from 'tapyrusjs-lib';
import { createWallet, setUpStub } from './testutil';

import * as sinon from 'sinon';

describe('Wallet', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('importExtendedPrivateKey', () => {
    const { wallet: alice, keyStore } = createWallet('prod');
    const xpriv =
      'xprv9s21ZrQH143K2xjLUb6KPjDjExyBLXq6K9u1gGQVMLyvewCLXdivoY7w3iRxAk1eX7k51Dxy71QdfRSQMmiMUGUi5iKfsKh2wfZVEGcqXEe';
    it('add key to storage', async () => {
      await alice.importExtendedPrivateKey(xpriv);
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
        await alice.importExtendedPrivateKey(xpriv);
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
        alice
          .importExtendedPrivateKey(xpriv)
          .then(
            () => assert.fail(),
            (err: Error) =>
              assert.strictEqual(err.message, 'Invalid network version'),
          );
      });
    });

    context('invalid format', () => {
      const { wallet: alice } = createWallet('prod');
      const xpriv =
        '8ZgxMBicQKsPeqL5kfoFJ8pSjCAeYnqZuKpzgCFmenmr24wM3AiLx1sgUetKLEQmPq6Vn9K44ZEDDuFx1LydXu8dyXPtUz1p1L85ZZoMUFK';
      it('throw exception', async () => {
        alice
          .importExtendedPrivateKey(xpriv)
          .then(
            () => assert.fail(),
            (err: Error) => assert.strictEqual(err.message, 'Invalid checksum'),
          );
      });
    });

    context('already added', () => {
      it('not add the key', async () => {
        await alice.importExtendedPrivateKey(xpriv);
        let keys = await keyStore.keys();
        assert.strictEqual(keys.length, 1);

        await alice.importExtendedPrivateKey(xpriv);
        keys = await keyStore.keys();
        assert.strictEqual(keys.length, 1);
      });
    });
  });

  describe('importWif', () => {
    const { wallet: alice, keyStore } = createWallet('prod');
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    it('add key to storage', async () => {
      await alice.importWif(wif);
      const keys = await keyStore.keys();
      assert.deepStrictEqual(keys, [
        '5bff37ef1fa65b660d26d28f65b06781e6576d3787a50df61a24ec2f22127fb5',
      ]);
    });

    context('in dev mode', () => {
      const { wallet: alice, keyStore } = createWallet('dev');
      const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('add key to storage', async () => {
        await alice.importWif(wif);
        const keys = await keyStore.keys();
        assert.deepStrictEqual(keys, [
          '5bff37ef1fa65b660d26d28f65b06781e6576d3787a50df61a24ec2f22127fb5',
        ]);
      });
    });

    context('invalid network version', () => {
      const { wallet: alice } = createWallet('prod');
      const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('throw exception', () => {
        alice
          .importWif(wif)
          .then(
            () => assert.fail(),
            (err: Error) =>
              assert.strictEqual(err.message, 'Invalid network version'),
          );
      });
    });

    context('invalid format', () => {
      const { wallet: alice } = createWallet('prod');
      const wif = 'xQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
      it('throw exception', () => {
        alice
          .importWif(wif)
          .then(
            () => assert.fail(),
            (err: Error) => assert.strictEqual(err.message, 'Invalid checksum'),
          );
      });
    });

    context('already added', () => {
      it('not add the key', async () => {
        await alice.importWif(wif);
        let keys = await keyStore.keys();
        assert.strictEqual(keys.length, 1);

        await alice.importWif(wif);
        keys = await keyStore.keys();
        assert.strictEqual(keys.length, 1);
      });
    });
  });

  describe('update', () => {
    const unspents1 = [
      {
        tx_hash:
          '0000000000000000000000000000000000000000000000000000000000000000',
        height: 101,
        tx_pos: 0,
        color_id:
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 50_000_000,
      },
    ];

    const expected1 = [
      new Utxo(
        '0000000000000000000000000000000000000000000000000000000000000000',
        101,
        0,
        '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        50_000_000,
      ),
    ];

    const unspents2 = [
      {
        tx_hash:
          '1111111111111111111111111111111111111111111111111111111111111111',
        height: 102,
        tx_pos: 1,
        color_id:
          'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 10_000_000,
      },
      {
        tx_hash:
          '2222222222222222222222222222222222222222222222222222222222222222',
        height: 102,
        tx_pos: 2,
        color_id:
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 10_000,
      },
    ];

    const expected2 = [
      new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        1,
        '21c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        10_000_000,
      ),
      new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        102,
        2,
        '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        10_000,
      ),
    ];

    it('save utxos', async () => {
      const { wallet: alice, dataStore } = createWallet('prod');
      const stub = setUpStub(alice);
      stub.onFirstCall().returns(new Promise(resolve => resolve(unspents1)));
      stub.onSecondCall().returns(new Promise(resolve => resolve(unspents2)));
      const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
      await alice.importWif(wif);
      await alice.update();
      assert.deepStrictEqual(dataStore.utxos, expected1);
      await alice.update();
      assert.deepStrictEqual(dataStore.utxos, expected2);
    });
  });

  describe('broadcast', async () => {
    context('send TPC transaction', async () => {
      const { wallet: alice, dataStore } = createWallet('prod');
      await alice.importWif(
        'KxqXXkQsa9Dbcr9vk1eSGghxka3btbAU4LaP9vDGhnHvPLX4wBsp',
      );
      await alice.importWif(
        'KzVEeCm3BW8FyqafRFbmSqNcSZWm5dM9J5hpXiTbFSZiGhw55Ws4',
      );

      const stub = setUpStub(alice);
      const unspents1 = [
        {
          tx_hash:
            '2222222222222222222222222222222222222222222222222222222222222222',
          height: 102,
          tx_pos: 1,
          value: 5_000,
        },
      ];
      const unspents2 = [
        {
          tx_hash:
            '2222222222222222222222222222222222222222222222222222222222222222',
          height: 102,
          tx_pos: 2,
          value: 5_000,
        },
      ];
      const expected_utxo = [
        new Utxo(
          '2222222222222222222222222222222222222222222222222222222222222222',
          102,
          1,
          '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
          '000000000000000000000000000000000000000000000000000000000000000000',
          5_000,
        ),
        new Utxo(
          '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7',
          0,
          0,
          '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
          '000000000000000000000000000000000000000000000000000000000000000000',
          1_000,
        ),
        new Utxo(
          '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7',
          0,
          1,
          '76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
          '000000000000000000000000000000000000000000000000000000000000000000',
          3_000,
        ),
      ];
      const response =
        '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7';
      stub.onFirstCall().returns(new Promise(resolve => resolve(unspents1)));
      stub.onSecondCall().returns(new Promise(resolve => resolve(unspents2)));
      stub.onThirdCall().returns(new Promise(resolve => resolve(response)));
      await alice.update();
      it('add/remove utxo which is used in transaction', async () => {
        const tx = new tapyrus.Transaction();
        tx.addInput(
          Buffer.from(
            '2222222222222222222222222222222222222222222222222222222222222222',
            'hex',
          ),
          2,
        );
        tx.addOutput(
          Buffer.from(
            '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
            'hex',
          ),
          1_000,
        );
        tx.addOutput(
          Buffer.from(
            '76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
            'hex',
          ),
          3_000,
        );
        const txid = await alice.broadcast(tx);
        assert.strictEqual(txid, tx.getId());
        assert.deepStrictEqual(dataStore.utxos, expected_utxo);
      });
    });

    context('send Colored transaction', async () => {
      const { wallet: alice, dataStore } = createWallet('prod');
      await alice.importWif(
        'KxqXXkQsa9Dbcr9vk1eSGghxka3btbAU4LaP9vDGhnHvPLX4wBsp',
      );
      await alice.importWif(
        'KzVEeCm3BW8FyqafRFbmSqNcSZWm5dM9J5hpXiTbFSZiGhw55Ws4',
      );

      const stub = setUpStub(alice);
      const unspents1 = [
        {
          tx_hash:
            '2222222222222222222222222222222222222222222222222222222222222222',
          height: 102,
          tx_pos: 0,
          color_id:
            'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          value: 100,
        },
        {
          tx_hash:
            '1111111111111111111111111111111111111111111111111111111111111111',
          height: 101,
          tx_pos: 1,
          value: 5_000,
        },
      ];
      const unspents2 = [
        {
          tx_hash:
            '2222222222222222222222222222222222222222222222222222222222222222',
          height: 102,
          tx_pos: 1,
          color_id:
            'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          value: 200,
        },
      ];
      const expected_utxo = [
        new Utxo(
          '2222222222222222222222222222222222222222222222222222222222222222',
          102,
          0,
          '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          100,
        ),
        new Utxo(
          '6e55b027e4329ab604e01542b6e4977a2b4eea4c63779167fabb9d134c0a97da',
          0,
          1,
          '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          199,
        ),
        new Utxo(
          '6e55b027e4329ab604e01542b6e4977a2b4eea4c63779167fabb9d134c0a97da',
          0,
          2,
          '76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
          '000000000000000000000000000000000000000000000000000000000000000000',
          3_000,
        ),
      ];
      const response =
        '6e55b027e4329ab604e01542b6e4977a2b4eea4c63779167fabb9d134c0a97da';
      stub.onFirstCall().returns(new Promise(resolve => resolve(unspents1)));
      stub.onSecondCall().returns(new Promise(resolve => resolve(unspents2)));
      stub.onThirdCall().returns(new Promise(resolve => resolve(response)));
      await alice.update();
      it('add/remove colored utxo which is used in transaction', async () => {
        const tx = new tapyrus.Transaction();
        tx.addInput(
          Buffer.from(
            '1111111111111111111111111111111111111111111111111111111111111111',
            'hex',
          ),
          1,
        );
        tx.addInput(
          Buffer.from(
            '2222222222222222222222222222222222222222222222222222222222222222',
            'hex',
          ),
          1,
        );
        tx.addOutput(
          Buffer.from(
            '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a9142f636ca97f1ad03e871f03094c1f3cc7d50d3ad988ac',
            'hex',
          ),
          1,
        );
        tx.addOutput(
          Buffer.from(
            '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
            'hex',
          ),
          199,
        );
        tx.addOutput(
          Buffer.from(
            '76a914b54a8b81dcf2da026e281dd88b14ca36f1ee903c88ac',
            'hex',
          ),
          3_000,
        );
        const txid = await alice.broadcast(tx);
        assert.strictEqual(txid, tx.getId());
        assert.deepStrictEqual(dataStore.utxos, expected_utxo);
      });
    });
  });

  describe('balances', () => {
    const unspents = [
      {
        tx_hash:
          '1111111111111111111111111111111111111111111111111111111111111111',
        height: 102,
        tx_pos: 1,
        color_id:
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 1_000,
      },
      {
        tx_hash:
          '2222222222222222222222222222222222222222222222222222222222222222',
        height: 102,
        tx_pos: 2,
        color_id:
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 2_000,
      },
      {
        tx_hash:
          '1111111111111111111111111111111111111111111111111111111111111111',
        height: 102,
        tx_pos: 3,
        color_id:
          'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 3_000,
      },
      {
        tx_hash:
          '2222222222222222222222222222222222222222222222222222222222222222',
        height: 0,
        tx_pos: 2,
        color_id:
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        value: 4_000,
      },
      {
        tx_hash:
          '2222222222222222222222222222222222222222222222222222222222222222',
        height: 102,
        tx_pos: 2,
        value: 5_000,
      },
    ];

    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    describe('uncolored coin', () => {
      it('get uncolored balance', async () => {
        const { wallet: alice } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(unspents)));
        await alice.importWif(wif);
        await alice.update();
        const balance = await alice.balance();
        assert.strictEqual(balance.unconfirmed, 0);
        assert.strictEqual(balance.confirmed, 5_000);
      });
    });

    describe('colored coin', () => {
      it('get colored balance', async () => {
        const { wallet: alice } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(unspents)));
        await alice.importWif(wif);
        await alice.update();
        const balance = await alice.balance(
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );
        assert.strictEqual(balance.unconfirmed, 4_000);
        assert.strictEqual(balance.confirmed, 3_000);
      });
    });
  });
});
