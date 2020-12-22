import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';

export class SignOptions {
  network?: tapyrus.Network;
}

export async function sign(
  wallet: Wallet,
  txb: tapyrus.TransactionBuilder,
  utxos: Utxo[],
  options?: SignOptions,
): Promise<tapyrus.TransactionBuilder> {
  await Promise.all(
    utxos.map(async (utxo: Utxo, index: number) => {
      const keyPair = await keyForScript(wallet, utxo.scriptPubkey, options);
      if (keyPair) {
        txb.sign({
          prevOutScriptType: utxo.type(),
          vin: index,
          keyPair,
        });
      }
    }),
  );
  return txb;
}

export async function keyForScript(
  wallet: Wallet,
  script: string,
  options?: SignOptions,
): Promise<tapyrus.ECPair.ECPairInterface | undefined> {
  const targetHash = outputToPubkeyHash(Buffer.from(script, 'hex'));
  const keys = await wallet.keyStore.keys();
  const network: tapyrus.Network =
    (options || {}).network || tapyrus.networks.prod;
  return keys
    .map(k => tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex'), { network }))
    .find(keyPair => {
      const hash = tapyrus.payments.p2pkh({ pubkey: keyPair.publicKey }).hash!;
      return hash.toString('hex') === targetHash.toString('hex');
    });
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
