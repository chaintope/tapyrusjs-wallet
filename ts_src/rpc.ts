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
  async request(
    config: Config,
    method: string,
    params: any[],
    headers?: any,
  ): Promise<any> {
    const data = { jsonrpc: '2.0', method, params };
    const response = await fetch(
      config.url(),
      rpcOptions(config, data, headers),
    ).then((r: Response) => r.json());

    if (response.error) {
      throw new Error(JSON.stringify(response.error));
    }

    return response.result;
  }
}
