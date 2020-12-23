import * as assert from 'assert';
import { describe, it } from 'mocha';
import * as tapyrus from 'tapyrusjs-lib';
import { FixedFeeProvider, SizeBasedFeeProvider } from '../src/fee_provider';

describe('FixedFeeProvider', () => {
  describe('fee', () => {
    it('should return fixed value', () => {
      const fee = new FixedFeeProvider(100);
      const tx = new tapyrus.Transaction();
      assert.strictEqual(fee.fee(tx), 100);
    });
  });
});

describe('SizeBasedFeeProvider', () => {
  describe('fee', () => {
    it('should return fixed value', () => {
      const fee = new SizeBasedFeeProvider(20);
      const tx = new tapyrus.Transaction();
      /// tx is '01000000000000000000'(10 bytes)
      assert.strictEqual(fee.fee(tx), 200);
    });
  });
});
