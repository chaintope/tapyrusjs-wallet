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
  request(config, method, params, headers) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const data = { jsonrpc: '2.0', method, params };
      const response = yield fetch(
        config.url(),
        rpcOptions(config, data, headers),
      ).then(r => r.json());
      return response;
    });
  }
}
exports.Rpc = Rpc;
