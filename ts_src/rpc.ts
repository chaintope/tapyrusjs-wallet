import { Config } from './config';

const rpcOptions = (config: Config, data: any, headers?: any): RequestInit => {
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
export class Rpc {
  // The number of published requests
  counter: number;

  constructor() {
    this.counter = 0;
  }

  async fetch(url: string, options?: any): Promise<Response> {
    return fetch(url, options);
  }

  async request(
    config: Config,
    method: string,
    params: any[],
    headers?: any,
  ): Promise<any> {
    const data = { jsonrpc: '2.0', method, params, id: ++this.counter };
    const response = await this.fetch(
      config.url(),
      rpcOptions(config, data, headers),
    ).then((r: Response) => r.json());

    if (response.error) {
      throw new Error(JSON.stringify(response.error));
    }

    return response.result;
  }
}
