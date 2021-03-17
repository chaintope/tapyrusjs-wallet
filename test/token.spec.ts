import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as tapyrus from 'tapyrusjs-lib';

import { createDummyTransaction, TransferParams } from '../src/token';
import { BaseWallet } from '../src/wallet';

describe('TokenParams', () => {
  describe('new', () => {
    const colorId =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const toAddress = '12URZZB1vXWTdqFiQqJCNPHftX2uAnWMos';
    const amount = 1;

    it('should take 3 parameters(colorId, amount, toAddress)', () => {
      const params = new TransferParams(colorId, amount, toAddress);
      assert.strictEqual(params.colorId, colorId);
      assert.strictEqual(params.amount, amount);
      assert.strictEqual(params.toAddress, toAddress);
    });

    context('with uncolored coin', () => {
      it('should take 2 parameters(undefined, amount, toAddress)', () => {
        const params = new TransferParams(undefined, amount, toAddress);
        assert.strictEqual(params.colorId, BaseWallet.COLOR_ID_FOR_TPC);
        assert.strictEqual(params.amount, amount);
        assert.strictEqual(params.toAddress, toAddress);
      });
    });
  });
});

describe('createDummyTransaction', () => {
  const txb = new tapyrus.TransactionBuilder();
  const tx = createDummyTransaction(txb);
  assert.strictEqual(tx.ins.length, 1);
  assert.strictEqual(tx.outs.length, 1);
});
