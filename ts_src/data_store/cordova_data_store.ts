import { DataStore } from '../data_store';
import AbstractSqlDataStore from './abstract_sql_data_store';

declare let sqlitePlugin: any;

export default class CordovaDataStore extends AbstractSqlDataStore
  implements DataStore {
  database: any;

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
