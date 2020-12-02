import * as assert from 'assert';
import { describe, it } from 'mocha';
// import * as tapyrus from 'tapyrusjs-lib';

import { sign } from '../src/signer';
import { BaseToken } from '../src/token';
import { Utxo } from '../src/utxo';
import { createWallet } from './testutil';


describe('Token', () => {
  describe('transfer', () => {
    const colorId =
      'c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    const token = new BaseToken();
    const { wallet: wallet } = createWallet('prod');
    const wif = 'KzJYKvdPEkuDanYNecre9QHe4ugRjvMvoLeceRr4j5u2j9gEyQ7n';
    wallet.importWif(wif);

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
      const signedTxb = await sign(wallet, result.txb, result.inputs);
      console.log(signedTxb.build().toHex());
    });
  });
});
