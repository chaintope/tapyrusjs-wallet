'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
class Balance {
  constructor(colorId, confirmed = 0, unconfirmed = 0) {
    this.colorId = colorId;
    this.confirmed = confirmed;
    this.unconfirmed = unconfirmed;
  }
}
exports.Balance = Balance;
