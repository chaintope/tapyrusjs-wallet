'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const tapyrus = require('tapyrusjs-lib');
const __1 = require('..');
const balance_1 = require('../balance');
const util = require('../util');
const utxo_1 = require('../utxo');
class AbstractSqlDataStore {
  migrate() {
    this.database.transaction(db => {
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
  add(utxos) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(db => {
        utxos.map(utxo => {
          db.executeSql(
            'INSERT INTO utxos(txid, height, outIndex, value, scriptPubkey, colorId) values (?, ?, ?, ?, ?, ?)',
            [
              utxo.txid,
              utxo.height,
              utxo.index,
              utxo.value,
              utxo.scriptPubkey,
              utxo.colorId || __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC,
            ],
          );
        });
      });
    });
  }
  processTx(keys, tx) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const hashes = util.keyToPubkeyHashes(keys);
      const txid = tx.getId();
      return new Promise((resolve, reject) => {
        this.database.transaction(
          db => {
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
              const payment = tapyrus.payments.util.fromOutputScript(script);
              if (payment && payment.hash) {
                if (hashes.includes(payment.hash.toString('hex'))) {
                  db.executeSql(
                    'INSERT INTO utxos(txid, height, outIndex, value, scriptPubkey, colorId) values (?, ?, ?, ?, ?, ?)',
                    [
                      txid,
                      0,
                      i,
                      tx.outs[i].value,
                      script.toString('hex'),
                      payment.colorId
                        ? payment.colorId.toString('hex')
                        : __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC,
                    ],
                  );
                }
              }
            }
            resolve();
          },
          error => {
            reject(error);
          },
        );
      });
    });
  }
  clear() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(db => {
        db.executeSql('DELETE FROM utxos');
      });
    });
  }
  balanceFor(keys, colorId = __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      const inClause = scripts.map(s => "'" + s + "'").join(',');
      return Promise.all([
        new Promise((resolve, reject) => {
          this.database.readTransaction(db => {
            db.executeSql(
              'SELECT SUM(value) as unconfirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height = 0',
              [colorId],
              (_db, rs) => {
                resolve(rs.rows.item(0).unconfirmed);
              },
              (_db, error) => {
                reject(error);
              },
            );
          });
        }),
        new Promise((resolve, reject) => {
          this.database.readTransaction(db => {
            db.executeSql(
              'SELECT SUM(value) as confirmed FROM utxos WHERE colorId = ? AND scriptPubkey in (' +
                inClause +
                ') AND height > 0',
              [colorId],
              (_db, rs) => {
                resolve(rs.rows.item(0).confirmed);
              },
              (_db, error) => {
                reject(error);
              },
            );
          });
        }),
      ]).then(([unconfirmed, confirmed]) => {
        return new balance_1.Balance(colorId, confirmed, unconfirmed);
      });
    });
  }
  utxosFor(keys, colorId) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      const inClause = scripts.map(s => "'" + s + "'").join(',');
      return new Promise((resolve, reject) => {
        this.database.readTransaction(db => {
          db.executeSql(
            'SELECT * FROM utxos WHERE colorId = ?  AND scriptPubkey in (' +
              inClause +
              ')',
            [colorId || __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC],
            (_db, rs) => {
              const utxos = [];
              for (let i = 0; i < rs.rows.length; i++) {
                utxos.push(
                  new utxo_1.Utxo(
                    rs.rows.item(i).txid,
                    rs.rows.item(i).height,
                    rs.rows.item(i).outIndex,
                    rs.rows.item(i).scriptPubkey,
                    rs.rows.item(i).colorId,
                    rs.rows.item(i).value,
                  ),
                );
              }
              resolve(utxos);
            },
            (_db, error) => {
              reject(error);
            },
          );
        });
      });
    });
  }
}
exports.default = AbstractSqlDataStore;
