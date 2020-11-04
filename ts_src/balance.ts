export class Balance {
  colorId: string;
  confirmed: number;
  unconfirmed: number;

  constructor(colorId: string, confirmed: number = 0, unconfirmed: number = 0) {
    this.colorId = colorId;
    this.confirmed = confirmed;
    this.unconfirmed = unconfirmed;
  }
}
