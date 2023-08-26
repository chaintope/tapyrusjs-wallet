import * as tapyrus from 'tapyrusjs-lib';
import MemoryKeyStore from './memory_key_store';

const WIF_KEYS_STORE_KEY = 'wifKeys';
const EXT_KEYS_STORE_KEY = 'extKeys';
const DEFAULT_KEYS_LIMIT = 5120;

/**
 * LocalKeyStore
 *
 * This KeyStore using `window.localStorage` for store any data.
 * If you create react app, then this dataStore helpful for keep data on browser.
 *
 * NOTE:
 *   Browser Local Storage has store limit that is 10 MB. Therefore,
 *   This class only stored until 5,120 items at default.
 *   This limit can be changed with constructor params.
 */
export default class LocalKeyStore extends MemoryKeyStore {
  _limit: number;

  constructor(network: tapyrus.networks.Network, limit = DEFAULT_KEYS_LIMIT) {
    super(network);
    this._limit = limit;

    const wifKeysJson = localStorage.getItem(WIF_KEYS_STORE_KEY) || '[]';
    const extKeysJson = localStorage.getItem(EXT_KEYS_STORE_KEY) || '[]';
    this._wifKeys = JSON.parse(wifKeysJson);
    this._extKeys = JSON.parse(extKeysJson);
  }

  async addPrivateKey(key: string): Promise<void> {
    this._wifKeys.push(key);
    this.checkLimit();
    localStorage.setItem(WIF_KEYS_STORE_KEY, JSON.stringify(this._wifKeys));
  }

  async addExtendedPrivateKey(extendedPrivateKey: string): Promise<void> {
    this._extKeys.push(extendedPrivateKey);
    this.checkLimit();
    localStorage.setItem(EXT_KEYS_STORE_KEY, JSON.stringify(this._extKeys));
  }

  async clear(): Promise<void> {
    this._wifKeys = [];
    this._extKeys = [];
    localStorage.setItem(WIF_KEYS_STORE_KEY, JSON.stringify(this._wifKeys));
    localStorage.setItem(EXT_KEYS_STORE_KEY, JSON.stringify(this._extKeys));
  }

  private checkLimit(): void {
    if (this._wifKeys.length + this._extKeys.length > this._limit) {
      throw Error(`Limit over error. Key items count was over ${this._limit}.`);
    }
  }
}
