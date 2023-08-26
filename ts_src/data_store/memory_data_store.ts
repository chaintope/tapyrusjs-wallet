import * as tapyrus from 'tapyrusjs-lib';
import { Balance } from '../balance';
import { DataStore } from '../data_store';
import * as util from '../util';
import { Utxo } from '../utxo';

/**
 * MemoryDataStore
 *
 * This DataStore is very simple store that save any data in flush memory.
 */
export default class MemoryDataStore implements DataStore {
  utxos: Utxo[] = [];

  async clear(): Promise<void> {
    this.utxos = [];
  }

  async add(utxos: Utxo[]): Promise<void> {
    this.utxos = this.utxos.concat(utxos);
  }

  async all(): Promise<Utxo[]> {
    return this.utxos;
  }

  async utxosFor(keys: string[], colorId?: string): Promise<Utxo[]> {
    const scripts = util.keyToScript(keys, colorId);
    return this.utxos.filter((utxo: Utxo) => {
      return scripts.find((script: string) => script === utxo.scriptPubkey);
    });
  }

  async balanceFor(keys: string[], colorId?: string): Promise<Balance> {
    const utxos = await this.utxosFor(keys, colorId);
    return util.sumBalance(utxos, colorId);
  }

  async processTx(_keys: string[], _tx: tapyrus.Transaction): Promise<void> {
    return;
  }
}
