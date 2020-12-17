import { BaseWallet } from './wallet';
export class Utxo {
  txid: string;
  height: number;
  index: number;
  value: number;
  scriptPubkey: string;
  colorId: string;

  constructor(
    txid: string,
    height: number,
    index: number,
    scriptPubkey: string,
    colorId: string,
    value: number,
  ) {
    this.txid = txid;
    this.height = height;
    this.index = index;
    this.scriptPubkey = scriptPubkey;
    this.colorId = colorId;
    this.value = value;
  }

  type(): string {
    if (this.colorId !== BaseWallet.COLOR_ID_FOR_TPC) {
      return 'cp2pkh';
    } else {
      return 'p2pkh';
    }
  }
}
