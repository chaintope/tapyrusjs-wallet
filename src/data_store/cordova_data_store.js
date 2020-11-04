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
const util = require('../util');
const utxo_1 = require('../utxo');
class CordovaDataStore {
  constructor() {
    this.database = sqlitePlugin.openDatabase({
      name: 'db',
      location: 'default',
      androidDatabaseProvider: 'system',
    });
    this.database.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS utxos(txid, height, outIndex, value, scriptPubkey, colorId)',
      );
    });
  }
  add(utxos) {
    return __awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(tx => {
        utxos.map(utxo => {
          tx.executeSql(
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
  clear() {
    return __awaiter(this, void 0, void 0, function*() {
      return this.database.transaction(tx => {
        tx.executeSql('DELETE FROM utxos');
      });
    });
  }
  balanceFor(keys, colorId) {
    return __awaiter(this, void 0, void 0, function*() {
      const scripts = util.keyToScript(keys, colorId);
      return new Promise((resolve, reject) => {
        this.database.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM utxos WHERE colorId = ?',
            [colorId || __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC],
            (_tx, rs) => {
              const utxos = [];
              for (let i = 0; i < rs.rows.length; i++) {
                if (scripts.includes(rs.rows.item(i).scriptPubkey)) {
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
              }
              resolve(
                util.sumBalance(
                  utxos,
                  colorId || __1.Wallet.BaseWallet.COLOR_ID_FOR_TPC,
                ),
              );
            },
            (_tx, error) => {
              reject(error);
            },
          );
        });
      });
    });
  }
}
exports.default = CordovaDataStore;
