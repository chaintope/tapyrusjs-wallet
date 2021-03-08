'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const rpcOptions = (config, data, headers) => {
  return {
    method: 'POST',
    cache: 'no-cache',
    headers: Object.assign(
      {
        'Content-Type': 'application/json',
      },
      config.headers,
      headers,
    ),
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  };
};
class Rpc {
  constructor() {
    this.counter = 0;
  }
  fetch(url, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return fetch(url, options);
    });
  }
  request(config, method, params, headers) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const data = { jsonrpc: '2.0', method, params, id: ++this.counter };
      const response = yield this.fetch(
        config.url(),
        rpcOptions(config, data, headers),
      ).then(r => r.json());
      if (response.error) {
        throw new Error(JSON.stringify(response.error));
      }
      return response.result;
    });
  }
}
exports.Rpc = Rpc;
