import * as assert from 'assert';
import { describe, it } from 'mocha';
import LocalDataStore from '../src/data_store/local_data_store';
import { Utxo } from '../src/utxo';

describe('LocalDataStore', () => {
  const utxos = [
    new Utxo(
      '1111111111111111111111111111111111111111111111111111111111111111',
      102,
      1,
      '21c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffbc76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
      'c2ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      10_000_000,
    ),
    new Utxo(
      '2222222222222222222222222222222222222222222222222222222222222222',
      102,
      1,
      '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
      '000000000000000000000000000000000000000000000000000000000000000000',
      10_000_000,
    ),
  ];

  beforeEach(() => {
    // store previouse datas.
    localStorage.setItem('utxos', JSON.stringify(utxos));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('can load previous storage data', async () => {
    const dataStore = new LocalDataStore();
    assert.strictEqual(dataStore.utxos.length, 2);
  });
  it('add utxos', async () => {
    const dataStore = new LocalDataStore();
    const _utxos = [
      new Utxo(
        '2222222222222222222222222222222222222222222222222222222222222222',
        102,
        1,
        '76a914e18c333242b4d4ecbdc9b7071743b5bce53ea0ad88ac',
        '000000000000000000000000000000000000000000000000000000000000000000',
        10_000_000,
      ),
    ];
    await dataStore.add(_utxos);
    const expect = new LocalDataStore();
    assert.strictEqual(expect.utxos.length, 3);
  });
  it('clear localStorage', async () => {
    const dataStore = new LocalDataStore();
    await dataStore.clear();
    const expect = new LocalDataStore();
    assert.strictEqual(expect.utxos.length, 0);
  });
  it('has error when limit over', () => {
    const dataStore = new LocalDataStore(3);
    return dataStore
      .add(utxos)
      .then(
        () => assert.fail('must throw error.'),
        (e: Error) =>
          assert.strictEqual(
            e.message,
            'Limit over error. Utxo items count was over 3.',
          ),
      );
  });
});
