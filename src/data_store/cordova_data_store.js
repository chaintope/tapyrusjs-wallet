'use strict';
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : new P(function(resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, '__esModule', { value: true });
// import { script } from 'tapyrusjs-lib';
const __1 = require('..');
const balance_1 = require('../balance');
const util = require('../util');
class CordovaDataStore {
  constructor() {
    this.database = sqlitePlugin.openDatabase({
      name: 'db',
      location: 'default',
      androidDatabaseProvider: 'system',
    });
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
    return __awaiter(this, void 0, void 0, function*() {
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
  remove(txid, index) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(db => {
        db.executeSql(
          'DELETE FROM utxos WHERE txid = ? AND outIndex = ?',
          txid,
          index,
        );
      });
    });
  }
  clear() {
    return __awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(db => {
        db.executeSql('DELETE FROM utxos');
      });
    });
  }
  balanceFor(keys, colorId = __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC) {
    return __awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      const inClause = scripts.map(s => "'" + s + "'").join(',');
      return Promise.all([
        new Promise((resolve, reject) => {
          this.database.transaction(db => {
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
          this.database.transaction(db => {
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
}
exports.default = CordovaDataStore;
