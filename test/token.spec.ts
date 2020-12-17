import * as assert from 'assert';
import { describe, it } from 'mocha';

import { BaseToken, TokenParams } from '../src/token';
import { Utxo } from '../src/utxo';
import Wallet from '../src/wallet';
import { createWallet } from './testutil';

describe('TokenParams', () => {
  describe('new', () => {
    const colorId =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const toAddress = '12URZZB1vXWTdqFiQqJCNPHftX2uAnWMos';
    const amount = 1;

    it('should take 3 parameters(colorId, amount, toAddress)', () => {
      const params = new TokenParams(colorId, amount, toAddress);
      assert.strictEqual(params.colorId, colorId);
      assert.strictEqual(params.amount, amount);
      assert.strictEqual(params.toAddress, toAddress);
    });
  });
});

describe('Token', () => {
  const utxos = [
    new Utxo(
      '2222222222222222222222222222222222222222222222222222222222222222',
      102,
      1,
      '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
      '000000000000000000000000000000000000000000000000000000000000000000',
      5_000,
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
  const toAddress = '12URZZB1vXWTdqFiQqJCNPHftX2uAnWMos';
  const amount = 1;

  function setUpWallet(): Wallet {
    const { wallet: wallet } = createWallet('prod');
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    wallet.importWif(wif);
    return wallet;
  }

  describe('transfer single token', () => {
    const colorId =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const token = new BaseToken();
    const wallet = setUpWallet();

    it('should build transaction', async () => {
      await wallet.dataStore.add(utxos);
      const changePubkeyScript = Buffer.from(
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'hex',
      );
      const result = await token.transfer(
        wallet,
        [
          {
            colorId: colorId,
            amount: amount,
            toAddress: toAddress,
          },
        ],
        changePubkeyScript,
      );
      const tx = result.txb.buildIncomplete();
      assert.strictEqual(tx.ins.length, 2);
      assert.strictEqual(tx.outs.length, 3);
    });
  });

  describe('transfer multiple token', () => {
    const colorId1 =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const colorId2 =
      'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const token = new BaseToken();
    const wallet = setUpWallet();

    it('should build transaction', async () => {
      await wallet.dataStore.add(utxos);
      const changePubkeyScript = Buffer.from(
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'hex',
      );
      const result = await token.transfer(
        wallet,
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
      const tx = result.txb.buildIncomplete();
      assert.strictEqual(tx.ins.length, 3);
      assert.strictEqual(tx.outs.length, 5);
    });
  });
});
