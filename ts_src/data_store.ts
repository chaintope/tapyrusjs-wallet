import { Balance } from './balance';
import { Utxo } from './utxo';

import CordovaDataStore from './data_store/cordova_data_store';
export { CordovaDataStore };

export interface DataStore {
  clear(): Promise<void>;
  add(utxos: Utxo[]): Promise<void>;
  balanceFor(keys: string[], colorId?: string): Promise<Balance>;
}
