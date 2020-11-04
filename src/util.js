'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
const balance_1 = require('./balance');
const wallet = require('./wallet');
function keyToScript(keys, colorId) {
  return keys.map(key => {
    const pubkey = tapyrus.ECPair.fromPrivateKey(Buffer.from(key, 'hex'))
      .publicKey;
    if (colorId) {
      return tapyrus.payments
        .cp2pkh({ pubkey, colorId: Buffer.from(colorId, 'hex') })
        .output.toString('hex');
    } else {
      return tapyrus.payments.p2pkh({ pubkey }).output.toString('hex');
    }
  });
}
exports.keyToScript = keyToScript;
function sumBalance(utxos, colorId = wallet.BaseWallet.COLOR_ID_FOR_TPC) {
  const balance = new balance_1.Balance(
    colorId || wallet.BaseWallet.COLOR_ID_FOR_TPC,
  );
  return utxos
    .filter(utxo => utxo.colorId === colorId)
    .reduce((sum, current) => {
      if (current.height === 0) {
        sum.unconfirmed += current.value;
      } else {
        sum.confirmed += current.value;
      }
      return sum;
    }, balance);
}
exports.sumBalance = sumBalance;
function belongsToPrivateKeys(keys, privateKey) {
  if (privateKey) {
    return keys.includes(privateKey.toString('hex'));
  } else {
    return false;
  }
}
exports.belongsToPrivateKeys = belongsToPrivateKeys;
