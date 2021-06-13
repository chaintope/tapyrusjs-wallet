import { DataStore } from '../data_store';
import AbstractSqlDataStore from './abstract_sql_data_store';
export default class CordovaDataStore extends AbstractSqlDataStore implements DataStore {
    database: any;
    constructor();
}
