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

  async balanceFor(keys: string[], colorId?: string): Promise<Balance> {
    const scripts: string[] = util.keyToScript(keys, colorId);

    return new Promise(
      (resolve, reject): void => {
        this.database.transaction((tx: any) => {
          tx.executeSql(
            'SELECT * FROM utxos WHERE colorId = ?',
            [colorId || Wallet.BaseWallet.COLOR_ID_FOR_TPC],
            (_tx: any, rs: any) => {
              const utxos: Utxo[] = [];
              for (let i = 0; i < rs.rows.length; i++) {
                if (scripts.includes(rs.rows.item(i).scriptPubkey)) {
                  utxos.push(
                    new Utxo(
                      rs.rows.item(i).txid,
                      rs.rows.item(i).height,
                      rs.rows.item(i).outIndex,
                      rs.rows.item(i).scriptPubkey,
                      rs.rows.item(i).colorId,
                      rs.rows.item(i).value,
                    ),
                  );
                }
              }
              resolve(
                util.sumBalance(
                  utxos,
                  colorId || Wallet.BaseWallet.COLOR_ID_FOR_TPC,
                ),
              );
            },
            (_tx: any, error: any) => {
              reject(error);
            },
          );
        });
      },
    );
  }
}
