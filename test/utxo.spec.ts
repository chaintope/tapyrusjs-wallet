import * as assert from 'assert';
import { describe, it } from 'mocha';
import { Utxo } from '../src/utxo';

describe('Utxo', () => {
  describe('type', () => {
    context('for colored coin', () => {
      const utxo = new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        1,
        '21c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        10_000_000,
      );
      it('should return cp2pkh', () => {
        assert.strictEqual(utxo.type(), 'cp2pkh');
      });
    });

    context('for uncolored coin', () => {
      const utxo = new Utxo(
        '1111111111111111111111111111111111111111111111111111111111111111',
        102,
        1,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        10_000_000,
      );
      it('should return p2pkh', () => {
        assert.strictEqual(utxo.type(), 'p2pkh');
      });
    });
  });
});
