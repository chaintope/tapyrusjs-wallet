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
exports.TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
class BaseToken {
  constructor(colorId) {
    this.colorId = colorId;
  }
  transfer(wallet, toAddress, amount) {
    return __awaiter(this, void 0, void 0, function*() {
      const txb = new tapyrus.TransactionBuilder();
      const coloredUtxos = yield wallet.utxos(this.colorId);
      const { sum: sumToken, collected: tokens } = this.collect(
        coloredUtxos,
        amount,
      );
      const coloredScript = this.addressToOutput(
        toAddress,
        Buffer.from(this.colorId, 'hex'),
      );
      const uncoloredUtxos = yield wallet.utxos();
      const fee = wallet.estimatedFee(this.transferTxSize());
      const { sum: sumTpc, collected: tpcs } = this.collect(
        uncoloredUtxos,
        fee,
      );
      const uncoloredScript = this.addressToOutput(toAddress, undefined);
      tokens.map(utxo => {
        txb.addInput(utxo.txid, utxo.index);
      });
      tpcs.map(utxo => {
        txb.addInput(utxo.txid, utxo.index);
      });
      txb.addOutput(coloredScript, sumToken - amount);
      txb.addOutput(uncoloredScript, sumTpc - fee);
      let i = 0;
      console.log(txb);
      tokens.forEach(utxo =>
        __awaiter(this, void 0, void 0, function*() {
          const keyPair = yield this.keyForScript(wallet, utxo.scriptPubkey);
          console.log(keyPair);
          txb.sign({
            prevOutScriptType: 'p2pkh',
            vin: i++,
            keyPair,
          });
        }),
      );
      tpcs.forEach(utxo =>
        __awaiter(this, void 0, void 0, function*() {
          const keyPair = yield this.keyForScript(wallet, utxo.scriptPubkey);
          console.log(keyPair);
          txb.sign({
            prevOutScriptType: 'p2pkh',
            vin: i++,
            keyPair,
          });
        }),
      );
      return txb.build();
    });
  }
  keyForScript(wallet, script) {
    return __awaiter(this, void 0, void 0, function*() {
      const payment = this.outputToPayment(Buffer.from(script, 'hex'));
      const keys = yield wallet.keyStore.keys();
      return keys
        .map(k => tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex')))
        .find(
          keyPair =>
            keyPair.publicKey.toString('hex') === payment.hash.toString('hex'),
        );
    });
  }
  outputToPayment(output) {
    try {
      return tapyrus.payments.cp2pkh({ output });
    } catch (_a) {}
    try {
      return tapyrus.payments.p2pkh({ output });
    } catch (_b) {}
    throw new Error('Invalid script type');
  }
  addressToOutput(address, colorId) {
    console.log(address, colorId);
    if (colorId) {
      try {
        return tapyrus.payments.cp2pkh({ address }).output;
      } catch (e) {
        console.log(e);
      }
      try {
        const hash = tapyrus.payments.p2pkh({ address }).hash;
        return tapyrus.payments.cp2pkh({ hash, colorId }).output;
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        return tapyrus.payments.p2pkh({ address }).output;
      } catch (e) {
        console.log(e);
      }
    }
    throw new Error('Invalid address type.');
  }
  collect(utxos, amount) {
    let sum = 0;
    const collected = [];
    utxos.forEach(utxo => {
      sum += utxo.value;
      collected.push(utxo);
      if (sum >= amount) {
        return;
      }
    });
    if (sum >= amount) {
      return { sum, collected };
    } else {
      throw new Error('Insufficient Token');
    }
  }
  //  Tx
  //    Version no ... 4
  //    In-counter ... 1
  //    inputs ... 226
  //        inputs[0] (Token input)
  //            Previous Transaction hash  ... 32
  //            Previous Txout-index ... 4
  //            Txin-script length ... 1
  //            scriptSig ... 72
  //            sequence_no ... 4
  //        inputs[1] (Tpc input)
  //            Previous Transaction hash  ... 32
  //            Previous Txout-index ... 4
  //            Txin-script length ... 1
  //            scriptSig ... 72
  //            sequence_no ... 4
  //    Out-counter ... 1
  //    outputs ... 202
  //        outputs[0] (Token output)
  //            value ... 8
  //            Txout-script length ... 1
  //            scriptPubKey ... 60
  //        outputs[1] (Token change)
  //            value ... 8
  //            Txout-script length ... 1
  //            scriptPubKey ... 60
  //        outputs[2] (Tpc output)
  //            value ... 8
  //            Txout-script length ... 1
  //            scriptPubKey ... 25
  //        outputs[3] (Tpc change)
  //            value ... 8
  //            Txout-script length ... 1
  //            scriptPubKey ... 25
  //    lock_time ... 4
  transferTxSize() {
    return 438;
  }
}
exports.BaseToken = BaseToken;
