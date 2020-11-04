import * as tapyrus from 'tapyrusjs-lib';
export declare class Config {
    schema: string;
    host?: string;
    port?: string;
    path?: string;
    headers: {
        [key: string]: string;
    };
    network: tapyrus.Network;
    constructor(params: any);
    url(): string;
}
