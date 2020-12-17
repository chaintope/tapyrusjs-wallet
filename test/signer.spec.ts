import * as assert from 'assert';
import { describe, it } from 'mocha';

import { keyForScript, outputToPubkeyHash, sign } from '../src/signer';
import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from '../src/utxo';
import { createWallet } from './testutil';

describe('Signer', () => {
  describe('sign', () => {
    it('should build complete transaction', async () => {
      const { wallet: alice } = createWallet('prod');
      await alice.importWif(
        'KxqXXkQsa9Dbcr9vk1eSGghxka3btbAU4LaP9vDGhnHvPLX4wBsp',
      );
      const txb = new tapyrus.TransactionBuilder();
      txb.setVersion(1);
      const utxo = new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        102,
        1,
        '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        5_000,
      );
      txb.addInput(
        utxo.txid,
        utxo.index,
        undefined,
        Buffer.from(utxo.scriptPubkey, 'hex'),
      );
      txb.addOutput(
        Buffer.from(
          '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
          'hex',
        ),
        4_000,
      );
      const result = await sign(alice, txb, [utxo]);
      const tx: tapyrus.Transaction = result.build();

      assert.strictEqual(tx.ins.length, 1);
      assert.strictEqual(
        tx.ins[0].script.toString('hex'),
        '483045022100eb47486064623868ae9ee782af256a6888c54d2a291f17a61c3c2eb5426f05a302204b7026e264abef7f57da30692c56bb057bbe9f6144fcc68eea54e4734250a95b0121020f4013c44b593282306193f954f737ea1cf33685dfab5d6a38f86aaff6f12d4e',
      );
      assert.strictEqual(tx.outs.length, 1);
    });
  });

  describe('keyForScript', async () => {
    const { wallet: alice } = createWallet('prod');
    await alice.importWif(
      'KxqXXkQsa9Dbcr9vk1eSGghxka3btbAU4LaP9vDGhnHvPLX4wBsp',
    );
    await alice.importWif(
      'KzVEeCm3BW8FyqafRFbmSqNcSZWm5dM9J5hpXiTbFSZiGhw55Ws4',
    );
    context('if key for scriptPubkey exists', () => {
      it('should return key ', async () => {
        const key = await keyForScript(
          alice,
          '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
        );
        assert.strictEqual(
          key!.privateKey!.toString('hex'),
          '30433e1ec20bdcf86495de605d223e8b044425b50705c04af6191a85cd7c457f',
        );
      });
    });

    context('if key not exist', () => {
      it('should return undefined', async () => {
        const key = await keyForScript(
          alice,
          '76a9142f636ca97f1ad03e871f03094c1f3cc7d50d3ad988ac',
        );
        assert.strictEqual(key, undefined);
      });
    });

    context('if script is colored', () => {
      it('should return key', async () => {
        const key = await keyForScript(
          alice,
          '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
        );
        assert.strictEqual(
          key!.privateKey!.toString('hex'),
          '30433e1ec20bdcf86495de605d223e8b044425b50705c04af6191a85cd7c457f',
        );
      });
    });
  });

  describe('outputToPubkeyHash', () => {
    context('cp2pkh', () => {
      it('should return public key hash for cp2pkh', () => {
        const hash = outputToPubkeyHash(
          Buffer.from(
            '21c1ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
            'hex',
          ),
        );
        assert.strictEqual(
          hash.toString('hex'),
          'b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a7',
        );
      });
    });

    context('p2pkh', () => {
      it('should return public key hash for p2pkh', () => {
        const hash = outputToPubkeyHash(
          Buffer.from(
            '76a914b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a788ac',
            'hex',
          ),
        );
        assert.strictEqual(
          hash.toString('hex'),
          'b17e8592e8ac58f7b8ed4360b3508a62ae5eb4a7',
        );
      });
    });

    context('p2sh', () => {
      it('should throw error', () => {
        assert.throws(() => {
          outputToPubkeyHash(
            Buffer.from(
              'a914722ff0bc2c3f47b35c20df646c395594da24e90e87',
              'hex',
            ),
          );
        }, new Error('Invalid script type'));
      });
    });
  });
});
