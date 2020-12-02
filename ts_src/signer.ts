import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet, { BaseWallet } from './wallet';

export async function sign(
  wallet: Wallet,
  txb: tapyrus.TransactionBuilder,
  utxos: Utxo[],
): Promise<tapyrus.TransactionBuilder> {
  await Promise.all(
    utxos.map(async (utxo: Utxo, index: number) => {
      const keyPair = await keyForScript(wallet, utxo.scriptPubkey);
      let type: string;
      if (utxo.colorId && utxo.colorId !== BaseWallet.COLOR_ID_FOR_TPC) {
        type = 'cp2pkh';
      } else {
        type = 'p2pkh';
      }
      txb.sign({
        prevOutScriptType: type,
        vin: index,
        keyPair,
      });
    }),
  );
  return txb;
}

export async function keyForScript(
  wallet: Wallet,
  script: string,
): Promise<tapyrus.ECPair.ECPairInterface> {
  const targetHash = outputToPubkeyHash(Buffer.from(script, 'hex'));
  const keys = await wallet.keyStore.keys();
  return keys
    .map(k => tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex')))
    .find(keyPair => {
      const hash = tapyrus.payments.p2pkh({ pubkey: keyPair.publicKey }).hash!;
      return hash.toString('hex') === targetHash.toString('hex');
    })!;
}

export function outputToPubkeyHash(output: Buffer): Buffer {
  try {
    return tapyrus.payments.cp2pkh({ output }).hash!;
  } catch {}
  try {
    return tapyrus.payments.p2pkh({ output }).hash!;
  } catch {}
  throw new Error('Invalid script type');
}
