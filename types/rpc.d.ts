import { Config } from './config';
export declare class Rpc {
    request(config: Config, method: string, params: any[], headers?: any): Promise<any>;
}
