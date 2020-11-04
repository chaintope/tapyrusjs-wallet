import * as assert from 'assert';
import { Balance } from '../src/balance';
import { describe, it } from 'mocha';
import * as util from '../src/util';
import { Utxo } from '../src/utxo';
import * as wallet from '../src/wallet';

describe('util', () => {
  describe('keyToScript', () => {
    const privateKey =
      'dbce05e935c31b0970396d75891fd4e8b8abe5aea72819436446399862967b15';
    context('without color id', () => {
      it('should convert key array to script array ', () => {
        assert.deepStrictEqual(util.keyToScript([privateKey]), [
          '76a9142f636ca97f1ad03e871f03094c1f3cc7d50d3ad988ac',
        ]);
      });
    });
    context('with color id', () => {
      const colorId =
        'c167feef0b09b4c4520d64556aae48bf7409fc6d32d2b17357f9ad742ce273f647';
      it('should convert key array to script array ', () => {
        assert.deepStrictEqual(util.keyToScript([privateKey], colorId), [
          '21c167feef0b09b4c4520d64556aae48bf7409fc6d32d2b17357f9ad742ce273f647bc76a9142f636ca97f1ad03e871f03094c1f3cc7d50d3ad988ac',
        ]);
      });
    });
  });
  describe('sumBalance', () => {
    const utxos = [
      new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        0,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        10_000_000,
      ),
      new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        1,
        '21c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        10_000_000,
      ),
      new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        2,
        '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        100_000,
      ),
      new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        3,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        10_000_000,
      ),
      new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        0,
        1,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        1_000_000,
      ),
      new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        0,
        2,
        '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        10_000,
      ),
    ];
    context('without color id', () => {
      it('should sum value for tpc', () => {
        const balance = new Balance(
          wallet.BaseWallet.COLOR_ID_FOR_TPC,
          20_000_000,
          1_000_000,
        );
        assert.deepStrictEqual(util.sumBalance(utxos), balance);
      });
    });

    context('with color id', () => {
      it('should sum value for colored coin', () => {
        const colorId =
          'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
        const balance = new Balance(colorId, 100_000, 10_000);
        assert.deepStrictEqual(util.sumBalance(utxos, colorId), balance);
      });
    });
  });
  describe('belongsToPrivateKeys', () => {
    const keys = [
      '0218271432b4066f5385600050038ef7ce48ee43e51bb8948e4b6a01aa1511b3',
      'fad719d77dd5c99457ac4ceba70d63771d6150c09ebc09905b4aa8226a52d399',
      'a10225f9754155443a2bf2577e916412f7cf31d2085130da98cd221d493cb269',
    ];
    context('when key is in keys', () => {
      it('should return true', () => {
        const privateKey = Buffer.from(
          'fad719d77dd5c99457ac4ceba70d63771d6150c09ebc09905b4aa8226a52d399',
          'hex',
        );
        assert.strictEqual(util.belongsToPrivateKeys(keys, privateKey), true);
      });
    });

    context('when key is not in keys', () => {
      it('should return false', () => {
        const privateKey = Buffer.from(
          'd854439a3150a5b01a9753de34e99e7cde89dad49ff62ce53fa3f75f5f5e53d9',
          'hex',
        );
        assert.strictEqual(util.belongsToPrivateKeys(keys, privateKey), false);
      });
    });

    context('for undefined', () => {
      it('should return false', () => {
        assert.strictEqual(util.belongsToPrivateKeys(keys, undefined), false);
      });
    });
  });
});
