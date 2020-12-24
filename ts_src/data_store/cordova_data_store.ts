import * as tapyrus from 'tapyrusjs-lib';
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
    this.database.transaction((db: any) => {
      db.executeSql(
        'CREATE TABLE IF NOT EXISTS utxos(txid TEXT NOT NULL, height INTEGER NOT NULL, outIndex INTEGER NOT NULL, value BIGINT NOT NULL, scriptPubkey TEXT NOT NULL, colorId TEXT NOT NULL)',
      );
      db.executeSql(
        'CREATE UNIQUE INDEX IF NOT EXISTS idxTxidAndOutIndex ON utxos(txid, outIndex)',
      );
      db.executeSql(
        'CREATE INDEX IF NOT EXISTS idxColorIdScriptPubkeyHeight ON utxos(colorId, scriptPubkey, height)',
      );
    });
  }

  async add(utxos: Utxo[]): Promise<void> {
    return this.database.transaction((db: any) => {
      utxos.map(utxo => {
        db.executeSql(
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

  async processTx(keys: string[], tx: tapyrus.Transaction): Promise<void> {
    const hashes = util.keyToPubkeyHashes(keys);

    return new Promise(
      (resolve, reject): void => {
        this.database.transaction(
          (db: any) => {
            for (const input of tx.ins) {
              db.executeSql(
                'DELETE FROM utxos WHERE txid = ? AND outIndex = ?',
                [
                  tapyrus.bufferutils.reverseBuffer(input.hash).toString('hex'),
                  input.index,
                ],
              );
            }
            for (let i = 0; i < tx.outs.length; i++) {
              const script = tx.outs[i].script;
              const payment: tapyrus.payments.Payment = tapyrus.payments.util.fromOutputScript(
                script,
              );

              if (payment && payment.hash) {
                if (hashes.includes(payment.hash.toString('hex'))) {
                  db.executeSql(
                    'INSERT INTO utxos(txid, height, outIndex, value, scriptPubkey, colorId) values (?, ?, ?, ?, ?, ?)',
                    [
                      tx.getId(),
                      0,
                      i,
                      tx.outs[i].value,
                      script.toString('hex'),
                      payment.colorId
                        ? payment.colorId.toString('hex')
                        : Wallet.BaseWallet.COLOR_ID_FOR_TPC,
                    ],
                  );
                }
              }
            }
            resolve();
          },
          (error: any) => {
            reject(error);
          },
        );
      },
    );
  }

  async clear(): Promise<void> {
    return this.database.transaction((db: any) => {
      db.executeSql('DELETE FROM utxos');
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
          this.database.readTransaction((db: any) => {
            db.executeSql(
              'SELECT SUM(value) as unconfirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height = 0',
              [colorId],
              (_db: any, rs: any) => {
                resolve(rs.rows.item(0).unconfirmed);
              },
              (_db: any, error: any) => {
                reject(error);
              },
            );
          });
        },
      ),
      new Promise(
        (resolve: (v: number) => void, reject): void => {
          this.database.readTransaction((db: any) => {
            db.executeSql(
              'SELECT SUM(value) as confirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height > 0',
              [colorId],
              (_db: any, rs: any) => {
                resolve(rs.rows.item(0).confirmed);
              },
              (_db: any, error: any) => {
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
