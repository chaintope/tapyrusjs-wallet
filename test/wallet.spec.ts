import * as assert from 'assert';
import { describe, it } from 'mocha';

import { Config } from '../src/config';
import MemoryDataStore from '../src/data_store/memory_data_store';
import MemoryKeyStore from '../src/key_store/memory_key_store';
import { Utxo } from '../src/utxo';
import * as tapyrus from 'tapyrusjs-lib';
import { createWallet, setUpStub } from './testutil';
import { BaseWallet } from '../src/wallet';

import * as sinon from 'sinon';
import { FixedFeeProvider, SizeBasedFeeProvider } from '../src/fee_provider';

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

    context('in dev mode', async () => {
      it('save utxos', async () => {
        const { wallet: alice, dataStore } = createWallet('dev');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(unspents1)));
        stub.onSecondCall().returns(new Promise(resolve => resolve(unspents2)));
        const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
        await alice.importWif(wif);
        await alice.update();
        assert.deepStrictEqual(dataStore.utxos, expected1);
        await alice.update();
        assert.deepStrictEqual(dataStore.utxos, expected2);
      });
    });
  });

  describe('broadcast', () => {
    const { wallet: alice } = createWallet('prod');
    const tx = new tapyrus.Transaction();
    const response =
      '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7';
    context('send TPC transaction', () => {
      it('should call rpc blockchain.transaction.broadcast', async () => {
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.broadcast(tx);
        assert.strictEqual(
          stub.calledOnceWith(
            alice.config,
            'blockchain.transaction.broadcast',
            [tx.toHex()],
          ),
          true,
        );
      });

      it('should call dataStore.processTx', async () => {
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        const spy = sinon.spy(alice.dataStore, 'processTx');
        await alice.broadcast(tx);
        assert.strictEqual(spy.calledOnce, true);
      });

      context('with options', () => {
        it('should call rpc blockchain.transaction.broadcast with additional headers and parameters', async () => {
          const stub = setUpStub(alice);
          stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
          const options = {
            headers: { Authorization: 'Bearer xxxx-xxxx-xxxx-xxxx' },
            params: ['param1', 0, 1, {}],
          };
          await alice.broadcast(tx, options);
          assert.strictEqual(
            stub.calledOnceWith(
              alice.config,
              'blockchain.transaction.broadcast',
              [tx.toHex(), 'param1', 0, 1, {}],
              { Authorization: 'Bearer xxxx-xxxx-xxxx-xxxx' },
            ),
            true,
          );
        });
      });
    });

    context('when RPC call failed', () => {
      it('should not call dataStore.processTx', async () => {
        const stub = setUpStub(alice);
        stub.onFirstCall().throws(new Error('some error'));
        const spy = sinon.spy(alice.dataStore, 'processTx');
        await alice
          .broadcast(tx)
          .then(_value => {
            assert.fail();
          })
          .catch(_reason => {
            assert.strictEqual(spy.notCalled, true);
          });
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

  describe('utxos', () => {
    const unspnets = [
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
      it('get uncolored utxos', async () => {
        const { wallet: alice } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(unspnets)));
        await alice.importWif(wif);
        await alice.update();
        const utxos = await alice.utxos();
        assert.strictEqual(utxos.length, 1);
      });
    });

    describe('colored coin', () => {
      it('get colored utxos', async () => {
        const { wallet: alice } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(unspnets)));
        await alice.importWif(wif);
        await alice.update();
        const utxos = await alice.utxos(
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        );
        assert.strictEqual(utxos.length, 3);
      });
    });
  });

  describe('estimatedFee', () => {
    context('with default fee rate', () => {
      it('calculate default fee for tx', () => {
        const tx = new tapyrus.Transaction();
        const { wallet: alice } = createWallet('prod');
        assert.strictEqual(alice.estimatedFee(tx), 100);
      });
    });

    context('with configured fee rate', () => {
      it('calculate fee for tx', () => {
        const tx = new tapyrus.Transaction();

        const config = new Config({
          host: 'example.org',
          port: '50001',
          path: '/',
          network: 'prod',
          feeProvider: new SizeBasedFeeProvider(30),
        });
        const keyStore = new MemoryKeyStore(config.network);
        const dataStore = new MemoryDataStore();
        const alice = new BaseWallet(keyStore, dataStore, config);
        assert.strictEqual(alice.estimatedFee(tx), 300);
      });
    });
  });

  describe('transfer', () => {
    const colorId1 =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const colorId2 =
      'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const utxos = [
      new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        102,
        1,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        10_000,
      ),
      new Utxo(
        '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7',
        0,
        0,
        '21c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        1_000,
      ),
      new Utxo(
        '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7',
        0,
        1,
        '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        3_000,
      ),
    ];
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    const toAddress = '12URZZB1vXWTdqFiQqJCNPHftX2uAnWMos';
    const amount = 1;
    const changePubkeyScript = Buffer.from(
      '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
      'hex',
    );
    const response =
      '9b9ebcb5bb47bf78b94fd696186926abc1daf756d833e90268d97fc1b370eca7';

    describe('transfer single token', () => {
      it('should build transaction', async () => {
        const { wallet: alice, dataStore } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.importWif(wif);
        await dataStore.add(utxos);
        const tx = await alice.transfer(
          [
            {
              colorId: colorId1,
              amount: amount,
              toAddress: toAddress,
            },
          ],
          changePubkeyScript,
        );
        assert.strictEqual(tx.ins.length, 2);
        assert.strictEqual(tx.outs.length, 3);
      });
    });

    describe('transfer multiple token', () => {
      it('should build transaction', async () => {
        const { wallet: alice, dataStore } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.importWif(wif);
        await dataStore.add(utxos);
        const tx = await alice.transfer(
          [
            {
              colorId: colorId1,
              amount: amount,
              toAddress: toAddress,
            },
            {
              colorId: colorId2,
              amount: amount,
              toAddress: toAddress,
            },
          ],
          changePubkeyScript,
        );
        assert.strictEqual(tx.ins.length, 3);
        assert.strictEqual(tx.outs.length, 5);
      });
    });

    context('in dev mode', () => {
      it('should build transaction', async () => {
        const wif = 'cQfXnqdEfpbUkE1e32fmWinhh8yqQNTcsNo5krJaECZ2ythpGjvB';
        const toAddress = 'mgzNrcFzjYwiQwjL8QGaCJVzkWdc7uH3hL';

        const { wallet: alice, dataStore } = createWallet('dev');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.importWif(wif);
        await dataStore.add(utxos);
        const tx = await alice.transfer(
          [
            {
              colorId: colorId1,
              amount: amount,
              toAddress: toAddress,
            },
          ],
          changePubkeyScript,
        );
        assert.strictEqual(tx.ins.length, 2);
        assert.strictEqual(tx.outs.length, 3);
      });
    });

    describe('transfer uncolored tpc', () => {
      it('should build transaction', async () => {
        const { wallet: alice, dataStore } = createWallet('prod');
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.importWif(wif);
        await dataStore.add(utxos);
        const tx = await alice.transfer(
          [
            {
              colorId: BaseWallet.COLOR_ID_FOR_TPC,
              amount: amount,
              toAddress: toAddress,
            },
          ],
          changePubkeyScript,
        );
        assert.strictEqual(tx.ins.length, 1);
        assert.strictEqual(tx.outs.length, 2);
        assert.strictEqual(tx.outs[0].value, 1);
        assert.strictEqual(
          tx.outs[0].script.toString('hex'),
          '76a9141027dc070ffc33ccc044d7e5f28048efd8623f2f88ac',
        );
      });
    });

    describe('transfer without transaction fee', () => {
      const createWalletWithoutFee = () => {
        const config = new Config({
          host: 'example.org',
          port: '50001',
          path: '/',
          network: tapyrus.networks.prod,
          feeProvider: new FixedFeeProvider(0),
        });
        const keyStore = new MemoryKeyStore(config.network);
        const dataStore = new MemoryDataStore();
        const wallet = new BaseWallet(keyStore, dataStore, config);
        return { wallet, keyStore, dataStore };
      };

      it('should build transaction', async () => {
        const { wallet: alice, dataStore } = createWalletWithoutFee();
        const stub = setUpStub(alice);
        stub.onFirstCall().returns(new Promise(resolve => resolve(response)));
        await alice.importWif(wif);
        await dataStore.add(utxos);
        const tx = await alice.transfer(
          [
            {
              colorId: colorId1,
              amount: amount,
              toAddress: toAddress,
            },
          ],
          changePubkeyScript,
        );
        assert.strictEqual(tx.ins.length, 2);
        assert.strictEqual(tx.outs.length, 3);
        assert.strictEqual(tx.outs[2].value, 10_000);
      });
    });
  });
});
