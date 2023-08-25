'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const abstract_sql_data_store_1 = require('./abstract_sql_data_store');
class CordovaDataStore extends abstract_sql_data_store_1.default {
  constructor() {
    super();
    this.database = sqlitePlugin.openDatabase({
      name: 'wallet.db',
      location: 'default',
      androidDatabaseProvider: 'system',
    });
    this.migrate();
  }
}
exports.default = CordovaDataStore;
