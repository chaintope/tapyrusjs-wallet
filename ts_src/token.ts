import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';

export interface Token {
  transfer(
    wallet: Wallet,
    toAddress: string,
    amount: number,
    changePubkeyScript: Buffer,
  ): Promise<{
    txb: tapyrus.TransactionBuilder;
    inputs: Utxo[];
  }>;
}

export class TokenParams {
  colorId: string;
  amount: number;
  toAddress: string;

  constructor(colorId: string, amount: number, toAddress: string) {
    this.colorId = colorId;
    this.amount = amount;
    this.toAddress = toAddress;
  }
}

export const TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
type TokenTypes = typeof TokenTypes[keyof typeof TokenTypes];

export class BaseToken {
  async transfer(
    wallet: Wallet,
    params: TokenParams[],
    changePubkeyScript: Buffer,
  ): Promise<{
    txb: tapyrus.TransactionBuilder;
    inputs: Utxo[];
  }> {
    const txb = new tapyrus.TransactionBuilder();
    txb.setVersion(1);

    const inputs: Utxo[] = [];

    const uncoloredScript = tapyrus.payments.p2pkh({
      output: changePubkeyScript,
    });
    params.forEach(async param => {
      const coloredUtxos = await wallet.utxos(param.colorId);
      const { sum: sumToken, collected: tokens } = this.collect(
        coloredUtxos,
        param.amount,
      );
      const coloredScript: Buffer = this.addressToOutput(
        param.toAddress,
        Buffer.from(param.colorId, 'hex'),
      );

      const changeColoredScript: Buffer = tapyrus.payments.cp2pkh({
        hash: uncoloredScript.hash,
        colorId: Buffer.from(param.colorId, 'hex'),
      }).output!;
      tokens.map((utxo: Utxo) => {
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
    });

    const uncoloredUtxos = await wallet.utxos();
    const fee = wallet.estimatedFee(this.transferTxSize());
    const { sum: sumTpc, collected: tpcs } = this.collect(uncoloredUtxos, fee);
    tpcs.map((utxo: Utxo) => {
      txb.addInput(
        utxo.txid,
        utxo.index,
        undefined,
        Buffer.from(utxo.scriptPubkey, 'hex'),
      );
      inputs.push(utxo);
    });
    txb.addOutput(uncoloredScript.output!, sumTpc - fee);
    return { txb, inputs };
  }

  private addressToOutput(
    address: string,
    colorId: Buffer | undefined,
  ): Buffer {
    if (colorId) {
      try {
        return tapyrus.payments.cp2pkh({ address }).output!;
      } catch (e) {}
      try {
        const hash = tapyrus.payments.p2pkh({ address }).hash!;
        return tapyrus.payments.cp2pkh({ hash, colorId }).output!;
      } catch (e) {}
    } else {
      try {
        return tapyrus.payments.p2pkh({ address }).output!;
      } catch (e) {}
    }
    throw new Error('Invalid address type.');
  }

  private collect(
    utxos: Utxo[],
    amount: number,
  ): { sum: number; collected: Utxo[] } {
    let sum = 0;
    const collected: Utxo[] = [];
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
  private transferTxSize(): number {
    return 438;
  }
}
