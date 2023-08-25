import * as assert from 'assert';
import { describe, it } from 'mocha';

import * as sinon from 'sinon';

import { Config } from '../src/config';
import { HDWallet } from '../src/wallet';

describe('Wallet', () => {
  afterEach(() => {
    sinon.restore();
  });

  const config = new Config({
    host: 'example.org',
    port: '50001',
    path: '/',
    network: 'prod',
  });

  describe('mnemonic', () => {
    it('mnemonic auto generate', async () => {
      // mnemonic is null, then wallet generate it.
      const hdwallet = new HDWallet(config);
      const expect = hdwallet.mnemonic(); // expect to mnemonic be generated.
      assert.notStrictEqual(expect, null);
    });
    it('mnemonic can set', async () => {
      const mnemonic =
        'rail dial elder music jaguar chaos smart trick tornado century citizen seek';
      const hdwallet = new HDWallet(config, mnemonic);
      const expect = hdwallet.mnemonic(); // apply constructor param.
      assert.strictEqual(expect, mnemonic);
    });
  });
});
