import { Config } from './config';
export declare class Rpc {
    counter: number;
    constructor();
    fetch(url: string, options?: any): Promise<Response>;
    request(config: Config, method: string, params: any[], headers?: any): Promise<any>;
}
