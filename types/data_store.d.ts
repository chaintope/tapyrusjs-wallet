export interface DataStore {
    set(key: string, value: any): void;
    get(key: string): any;
}
