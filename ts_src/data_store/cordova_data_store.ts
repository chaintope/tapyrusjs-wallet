// import { script } from 'tapyrusjs-lib';
import { Wallet } from '..';
import { Balance } from '../balance';
import { DataStore } from '../data_store';
import * as util from '../util';
import { Utxo } from '../utxo';

declare let sqlitePlugin: any;

export default class CordovaDataStore implements DataStore {
  database: any;

  constructor() {
    this.database = sqlitePlugin.openDatabase({
      name: 'db',
      location: 'default',
      androidDatabaseProvider: 'system',
    });
    this.database.transaction((tx: any) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS utxos(txid TEXT NOT NULL, height INTEGER NOT NULL, outIndex INTEGER NOT NULL, value BIGINT NOT NULL, scriptPubkey TEXT NOT NULL, colorId TEXT NOT NULL)',
      );
      tx.executeSql(
        'CREATE UNIQUE INDEX IF NOT EXISTS idxTxidAndOutIndex ON utxos(txid, outIndex)',
      );
      tx.executeSql('CREATE INDEX IF NOT EXISTS idxColorId ON utxos(colorId)');
    });
  }

  async add(utxos: Utxo[]): Promise<void> {
    return this.database.transaction((tx: any) => {
      utxos.map(utxo => {
        tx.executeSql(
          'INSERT INTO utxos(txid, height, outIndex, value, scriptPubkey, colorId) values (?, ?, ?, ?, ?, ?)',
          [
            utxo.txid,
            utxo.height,
            utxo.index,
            utxo.value,
            utxo.scriptPubkey,
            utxo.colorId || Wallet.BaseWallet.COLOR_ID_FOR_TPC,
          ],
        );
      });
    });
  }

  async clear(): Promise<void> {
    return this.database.transaction((tx: any) => {
      tx.executeSql('DELETE FROM utxos');
    });
  }

  async balanceFor(
    keys: string[],
    colorId: string = Wallet.BaseWallet.COLOR_ID_FOR_TPC,
  ): Promise<Balance> {
    const scripts: string[] = util.keyToScript(keys, colorId);
    const inClause = scripts.map(s => "'" + s + "'").join(',');
    return Promise.all([
      new Promise(
        (resolve: (v: number) => void, reject): void => {
          this.database.transaction((tx: any) => {
            tx.executeSql(
              'SELECT SUM(value) as unconfirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height = 0',
              [colorId],
              (_tx: any, rs: any) => {
                resolve(rs.rows.item(0).unconfirmed);
              },
              (_tx: any, error: any) => {
                reject(error);
              },
            );
          });
        },
      ),
      new Promise(
        (resolve: (v: number) => void, reject): void => {
          this.database.transaction((tx: any) => {
            tx.executeSql(
              'SELECT SUM(value) as confirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height > 0',
              [colorId],
              (_tx: any, rs: any) => {
                resolve(rs.rows.item(0).confirmed);
              },
              (_tx: any, error: any) => {
                reject(error);
              },
            );
          });
        },
      ),
    ]).then(([unconfirmed, confirmed]) => {
      return new Balance(colorId, confirmed, unconfirmed);
    });
  }
}
