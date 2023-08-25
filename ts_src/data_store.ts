import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from './balance';
import { Utxo } from './utxo';

import CordovaDataStore from './data_store/cordova_data_store';
import LocalDataStore from './data_store/local_data_store';
import MockDataStore from './data_store/mock_data_store';
import ReactDataStore from './data_store/react_data_store';
export { CordovaDataStore, ReactDataStore, MockDataStore, LocalDataStore };

export interface DataStore {
  clear(): Promise<void>;
  add(utxos: Utxo[]): Promise<void>;
  processTx(keys: string[], tx: tapyrus.Transaction): Promise<void>;
  balanceFor(keys: string[], colorId?: string): Promise<Balance>;
  utxosFor(keys: string[], colorId?: string): Promise<Utxo[]>;
}
