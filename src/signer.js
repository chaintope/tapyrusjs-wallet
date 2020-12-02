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
const wallet_1 = require('./wallet');
function sign(wallet, txb, utxos) {
  return __awaiter(this, void 0, void 0, function*() {
    yield Promise.all(
      utxos.map((utxo, index) =>
        __awaiter(this, void 0, void 0, function*() {
          const keyPair = yield keyForScript(wallet, utxo.scriptPubkey);
          let type;
          if (
            utxo.colorId &&
            utxo.colorId !== wallet_1.BaseWallet.COLOR_ID_FOR_TPC
          ) {
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
      ),
    );
    return txb;
  });
}
exports.sign = sign;
function keyForScript(wallet, script) {
  return __awaiter(this, void 0, void 0, function*() {
    const targetHash = outputToPubkeyHash(Buffer.from(script, 'hex'));
    const keys = yield wallet.keyStore.keys();
    return keys
      .map(k => tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex')))
      .find(keyPair => {
        const hash = tapyrus.payments.p2pkh({ pubkey: keyPair.publicKey }).hash;
        return hash.toString('hex') === targetHash.toString('hex');
      });
  });
}
exports.keyForScript = keyForScript;
function outputToPubkeyHash(output) {
  try {
    return tapyrus.payments.cp2pkh({ output }).hash;
  } catch (_a) {}
  try {
    return tapyrus.payments.p2pkh({ output }).hash;
  } catch (_b) {}
  throw new Error('Invalid script type');
}
exports.outputToPubkeyHash = outputToPubkeyHash;
