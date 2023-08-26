import MemoryDataStore from '../src/data_store/memory_data_store';
import MemoryKeyStore from '../src/key_store/memory_key_store';
import { Config } from '../src/config';
import { BaseWallet } from '../src/wallet';
import * as sinon from 'sinon';

export const createWallet = (
  network: string,
): {
  wallet: BaseWallet;
  keyStore: MemoryKeyStore;
  dataStore: MemoryDataStore;
} => {
  const config = new Config({
    host: 'example.org',
    port: '50001',
    path: '/',
    network,
  });
  const keyStore = new MemoryKeyStore(config.network);
  const dataStore = new MemoryDataStore();
  const wallet = new BaseWallet(keyStore, dataStore, config);
  return {
    wallet,
    keyStore,
    dataStore,
  };
};

export const setUpStub = (wallet: BaseWallet): sinon.SinonStub => {
  const stub = sinon.stub();
  wallet.rpc.request = (
    config: Config,
    method: string,
    params: any[],
    headers?: any,
  ) => {
    return stub(config, method, params, headers);
  };
  return stub;
};
