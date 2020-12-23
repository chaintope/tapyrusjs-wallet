import * as tapyrus from 'tapyrusjs-lib';
import { FeeProvider, SizeBasedFeeProvider } from './fee_provider';

export class Config {
  schema: string = 'http';
  host?: string;
  port?: string;
  path?: string;
  headers: { [key: string]: string } = {};
  network: tapyrus.Network = tapyrus.networks.prod;
  feeProvider: FeeProvider;
  constructor(params: any) {
    this.schema = params.schema || this.schema;
    this.host = params.host;
    this.port = params.port;
    this.path = params.path;
    this.headers = params.headers || this.headers;
    if (params.network === 'dev') {
      this.network = tapyrus.networks.dev;
    }
    this.feeProvider = params.feeProvider || new SizeBasedFeeProvider();
  }
  url(): string {
    return `${this.schema}://${this.host!}:${this.port!}/${this.path!}`;
  }
}
