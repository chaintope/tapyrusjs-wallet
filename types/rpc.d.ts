import { Config } from './config';
export declare class Rpc {
    counter: number;
    constructor();
    request(config: Config, method: string, params: any[], headers?: any): Promise<any>;
}
