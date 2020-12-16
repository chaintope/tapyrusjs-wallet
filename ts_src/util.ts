import * as tapyrus from 'tapyrusjs-lib';

import { Balance } from './balance';
import { KeyStore } from './key_store';
import { Utxo } from './utxo';
import * as wallet from './wallet';

export function keyToScript(
  keys: string[],
  colorId: string = wallet.BaseWallet.COLOR_ID_FOR_TPC,
): string[] {
  return keys.map(key => {
    const pubkey = tapyrus.ECPair.fromPrivateKey(Buffer.from(key, 'hex'))
      .publicKey;
    if (colorId !== wallet.BaseWallet.COLOR_ID_FOR_TPC) {
      return tapyrus.payments
        .cp2pkh({
          pubkey,
          colorId: Buffer.from(colorId, 'hex'),
        })
        .output!.toString('hex');
    } else {
      return tapyrus.payments.p2pkh({ pubkey }).output!.toString('hex');
    }
  });
}

export function sumBalance(
  utxos: Utxo[],
  colorId: string = wallet.BaseWallet.COLOR_ID_FOR_TPC,
): Balance {
  const balance = new Balance(colorId);
  return utxos
    .filter(utxo => utxo.colorId === colorId)
    .reduce((sum: Balance, current: Utxo) => {
      if (current.height === 0) {
        sum.unconfirmed += current.value;
      } else {
        sum.confirmed += current.value;
      }
      return sum;
    }, balance);
}

export async function belongsToPrivateKeys(
  keyStore: KeyStore,
  privateKey: Buffer | undefined,
): Promise<boolean> {
  const keys = await keyStore.keys();
  if (privateKey) {
    return keys.includes(privateKey.toString('hex'));
  } else {
    return false;
  }
}
