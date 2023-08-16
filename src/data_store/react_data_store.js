'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const SQLite = require('expo-sqlite');
const abstract_sql_data_store_1 = require('./abstract_sql_data_store');
class ReactDataStore extends abstract_sql_data_store_1.default {
  constructor() {
    super();
    this.database = SQLite.openDatabase('wallet');
    this.migrate();
  }
}
exports.default = ReactDataStore;
