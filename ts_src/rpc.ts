import { Config } from './config';

const rpcOptions = (config: Config, data: any): RequestInit => {
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
export class Rpc {
  async request(config: Config, method: string, params: any[]): Promise<any> {
    const data = { jsonrpc: '2.0', method, params };
    const response = await fetch(config.url(), rpcOptions(config, data)).then(
      (r: Response) => r.json(),
    );
    return response;
  }
}
