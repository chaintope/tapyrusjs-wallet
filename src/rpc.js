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
const rpcOptions = (config, data) => {
  return {
    method: 'POST',
    cache: 'no-cache',
    headers: Object.assign(
      {
        'Content-Type': 'application/json',
      },
      config.headers,
    ),
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data),
  };
};
class Rpc {
  request(config, method, params) {
    return __awaiter(this, void 0, void 0, function*() {
      const data = { jsonrpc: '2.0', method, params };
      const response = yield fetch(config.url(), rpcOptions(config, data)).then(
        r => r.json(),
      );
      return response;
    });
  }
}
exports.Rpc = Rpc;
