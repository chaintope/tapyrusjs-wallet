import * as SQLite from 'expo-sqlite';
import { DataStore } from '../data_store';
import AbstractSqlDataStore from './abstract_sql_data_store';
export default class ReactDataStore extends AbstractSqlDataStore implements DataStore {
    database: SQLite.Database;
    constructor();
}
