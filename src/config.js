'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tapyrus = require('tapyrusjs-lib');
const fee_provider_1 = require('./fee_provider');
class Config {
  constructor(params) {
    this.schema = 'http';
    this.headers = {};
    this.network = tapyrus.networks.prod;
    this.schema = params.schema || this.schema;
    this.host = params.host;
    this.port = params.port;
    this.path = params.path;
    this.headers = params.headers || this.headers;
    if (params.network === 'dev') {
      this.network = tapyrus.networks.dev;
    }
    this.feeProvider =
      params.feeProvider || new fee_provider_1.SizeBasedFeeProvider();
  }
  url() {
    return `${this.schema}://${this.host}:${this.port}/${this.path}`;
  }
}
exports.Config = Config;
