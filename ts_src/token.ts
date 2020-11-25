import * as tapyrus from 'tapyrusjs-lib';
import { Utxo } from './utxo';
import Wallet from './wallet';

export interface Token {
  transfer(
    wallet: Wallet,
    toAddress: string,
    amount: number,
  ): Promise<tapyrus.Transaction>;
}

export const TokenTypes = {
  REISSUBALE: 0xc1,
  NON_REISSUABLE: 0xc2,
  NFT: 0xc3,
};
type TokenTypes = typeof TokenTypes[keyof typeof TokenTypes];

export class BaseToken {
  colorId: string;

  constructor(colorId: string) {
    this.colorId = colorId;
  }

  async transfer(
    wallet: Wallet,
    toAddress: string,
    amount: number,
  ): Promise<tapyrus.Transaction> {
    const txb = new tapyrus.TransactionBuilder();

    const coloredUtxos = await wallet.utxos(this.colorId);
    const { sum: sumToken, collected: tokens } = this.collect(
      coloredUtxos,
      amount,
    );
    const coloredScript: Buffer = this.addressToOutput(
      toAddress,
      Buffer.from(this.colorId, 'hex'),
    );

    const uncoloredUtxos = await wallet.utxos();
    const fee = wallet.estimatedFee(this.transferTxSize());
    const { sum: sumTpc, collected: tpcs } = this.collect(uncoloredUtxos, fee);
    const uncoloredScript: Buffer = this.addressToOutput(toAddress, undefined);

    tokens.map((utxo: Utxo) => {
      txb.addInput(utxo.txid, utxo.index);
    });
    tpcs.map((utxo: Utxo) => {
      txb.addInput(utxo.txid, utxo.index);
    });
    txb.addOutput(coloredScript, sumToken - amount);
    txb.addOutput(uncoloredScript, sumTpc - fee);

    let i = 0;
    console.log(txb);
    tokens.forEach(async (utxo: Utxo) => {
      const keyPair = await this.keyForScript(wallet, utxo.scriptPubkey);
      console.log(keyPair);
      txb.sign({
        prevOutScriptType: 'p2pkh',
        vin: i++,
        keyPair,
      });
    });
    tpcs.forEach(async (utxo: Utxo) => {
      const keyPair = await this.keyForScript(wallet, utxo.scriptPubkey);
      console.log(keyPair);
      txb.sign({
        prevOutScriptType: 'p2pkh',
        vin: i++,
        keyPair,
      });
    });
    return txb.build();
  }

  private async keyForScript(
    wallet: Wallet,
    script: string,
  ): Promise<tapyrus.ECPair.ECPairInterface> {
    const payment = this.outputToPayment(Buffer.from(script, 'hex'));
    const keys = await wallet.keyStore.keys();
    return keys
      .map(k => tapyrus.ECPair.fromPrivateKey(Buffer.from(k, 'hex')))
      .find(
        keyPair =>
          keyPair.publicKey.toString('hex') === payment.hash!.toString('hex'),
      )!;
  }

  private outputToPayment(output: Buffer): tapyrus.Payment {
    try {
      return tapyrus.payments.cp2pkh({ output });
    } catch {}
    try {
      return tapyrus.payments.p2pkh({ output });
    } catch {}
    throw new Error('Invalid script type');
  }

  private addressToOutput(
    address: string,
    colorId: Buffer | undefined,
  ): Buffer {
    console.log(address, colorId);
    if (colorId) {
      try {
        return tapyrus.payments.cp2pkh({ address }).output!;
      } catch (e) {
        console.log(e);
      }
      try {
        const hash = tapyrus.payments.p2pkh({ address }).hash!;
        return tapyrus.payments.cp2pkh({ hash, colorId }).output!;
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        return tapyrus.payments.p2pkh({ address }).output!;
      } catch (e) {
        console.log(e);
      }
    }
    throw new Error('Invalid address type.');
  }

  private collect(
    utxos: Utxo[],
    amount: number,
  ): { sum: number; collected: Utxo[] } {
    let sum = 0;
    const collected: Utxo[] = [];
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
  private transferTxSize(): number {
    return 438;
  }
}
