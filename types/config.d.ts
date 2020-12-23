import * as tapyrus from 'tapyrusjs-lib';
import { FeeProvider } from './fee_provider';
export declare class Config {
    schema: string;
    host?: string;
    port?: string;
    path?: string;
    headers: {
        [key: string]: string;
    };
    network: tapyrus.Network;
    feeProvider: FeeProvider;
    constructor(params: any);
    url(): string;
}
