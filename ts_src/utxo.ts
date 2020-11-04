import * as tapyrus from 'tapyrusjs-lib';

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

  address(): string {
    return tapyrus.address.fromOutputScript(
      Buffer.from(this.scriptPubkey, 'hex'),
    );
  }
}
