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
class TokenParams {
  constructor(colorId, amount, toAddress) {
    this.colorId = colorId;
    this.amount = amount;
    this.toAddress = toAddress;
  }
}
exports.TokenParams = TokenParams;
exports.TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
class BaseToken {
  transfer(wallet, params, changePubkeyScript) {
    return __awaiter(this, void 0, void 0, function*() {
      const txb = new tapyrus.TransactionBuilder();
      txb.setVersion(1);
      const inputs = [];
      const uncoloredScript = tapyrus.payments.p2pkh({
        output: changePubkeyScript,
      });
      params.forEach(param =>
        __awaiter(this, void 0, void 0, function*() {
          const coloredUtxos = yield wallet.utxos(param.colorId);
          const { sum: sumToken, collected: tokens } = this.collect(
            coloredUtxos,
            param.amount,
          );
          const coloredScript = this.addressToOutput(
            param.toAddress,
            Buffer.from(param.colorId, 'hex'),
          );
          const changeColoredScript = tapyrus.payments.cp2pkh({
            hash: uncoloredScript.hash,
            colorId: Buffer.from(param.colorId, 'hex'),
          }).output;
          tokens.map(utxo => {
            txb.addInput(
              utxo.txid,
              utxo.index,
              undefined,
              Buffer.from(utxo.scriptPubkey, 'hex'),
            );
            inputs.push(utxo);
          });
          txb.addOutput(coloredScript, param.amount);
          txb.addOutput(changeColoredScript, sumToken - param.amount);
        }),
      );
      const uncoloredUtxos = yield wallet.utxos();
      const fee = wallet.estimatedFee(this.transferTxSize());
      const { sum: sumTpc, collected: tpcs } = this.collect(
        uncoloredUtxos,
        fee,
      );
      tpcs.map(utxo => {
        txb.addInput(
          utxo.txid,
          utxo.index,
          undefined,
          Buffer.from(utxo.scriptPubkey, 'hex'),
        );
        inputs.push(utxo);
      });
      txb.addOutput(uncoloredScript.output, sumTpc - fee);
      return { txb, inputs };
    });
  }
  addressToOutput(address, colorId) {
    if (colorId) {
      try {
        return tapyrus.payments.cp2pkh({ address }).output;
      } catch (e) {}
      try {
        const hash = tapyrus.payments.p2pkh({ address }).hash;
        return tapyrus.payments.cp2pkh({ hash, colorId }).output;
      } catch (e) {}
    } else {
      try {
        return tapyrus.payments.p2pkh({ address }).output;
      } catch (e) {}
    }
    throw new Error('Invalid address type.');
  }
  collect(utxos, amount) {
    let sum = 0;
    const collected = [];
    for (const utxo of utxos) {
      sum += utxo.value;
      collected.push(utxo);
      if (sum >= amount) {
        break;
      }
    }
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
