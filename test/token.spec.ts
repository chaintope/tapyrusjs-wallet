import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as tapyrus from 'tapyrusjs-lib';

import { createDummyTransaction, TransferParams } from '../src/token';

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
  });
});

describe('createDummyTransaction', () => {
  const txb = new tapyrus.TransactionBuilder();
  const tx = createDummyTransaction(txb);
  assert.strictEqual(tx.ins.length, 1);
  assert.strictEqual(tx.outs.length, 1);
});
