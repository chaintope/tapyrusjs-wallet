'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
const balance_1 = require('./balance');
const wallet = require('./wallet');
function keyToScript(keys, colorId = wallet.BaseWallet.COLOR_ID_FOR_TPC) {
  return keys.map(key => {
    const pubkey = tapyrus.ECPair.fromPrivateKey(Buffer.from(key, 'hex'))
      .publicKey;
    if (colorId !== wallet.BaseWallet.COLOR_ID_FOR_TPC) {
      return tapyrus.payments
        .cp2pkh({
          pubkey,
          colorId: Buffer.from(colorId, 'hex'),
        })
        .output.toString('hex');
    } else {
      return tapyrus.payments.p2pkh({ pubkey }).output.toString('hex');
    }
  });
}
exports.keyToScript = keyToScript;
function sumBalance(utxos, colorId = wallet.BaseWallet.COLOR_ID_FOR_TPC) {
  const balance = new balance_1.Balance(colorId);
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
function belongsToPrivateKeys(keyStore, privateKey) {
  return __awaiter(this, void 0, void 0, function*() {
    const keys = yield keyStore.keys();
    if (privateKey) {
      return keys.includes(privateKey.toString('hex'));
    } else {
      return false;
    }
  });
}
exports.belongsToPrivateKeys = belongsToPrivateKeys;
