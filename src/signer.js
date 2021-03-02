'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const tapyrus = require('tapyrusjs-lib');
class SignOptions {}
exports.SignOptions = SignOptions;
function sign(wallet, txb, utxos, options) {
  return tslib_1.__awaiter(this, void 0, void 0, function*() {
    yield Promise.all(
      utxos.map((utxo, index) =>
        tslib_1.__awaiter(this, void 0, void 0, function*() {
          const keyPair = yield keyForScript(
            wallet,
            utxo.scriptPubkey,
            options,
          );
          if (keyPair) {
            txb.sign({
              prevOutScriptType: utxo.type(),
              vin: index,
              keyPair,
            });
          }
        }),
      ),
    );
    return txb;
  });
}
exports.sign = sign;
function keyForScript(wallet, script, options) {
  return tslib_1.__awaiter(this, void 0, void 0, function*() {
    const targetHash = outputToPubkeyHash(Buffer.from(script, 'hex'));
    const keys = yield wallet.keyStore.keys();
    const network = (options || {}).network || tapyrus.networks.prod;
    return keys
      .map(k =>
        tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex'), { network }),
      )
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
