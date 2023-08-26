import * as tapyrus from 'tapyrusjs-lib';
import { KeyStore } from '../key_store';

/**
 * MemoryKeyStore
 *
 * This KeyStore is very simple store that save any data in flush memory.
 */
export default class MemoryKeyStore implements KeyStore {
  _wifKeys: string[] = [];
  _extKeys: string[] = [];
  network: tapyrus.networks.Network;

  constructor(network: tapyrus.networks.Network) {
    this.network = network;
  }

  async addPrivateKey(key: string): Promise<void> {
    this._wifKeys.push(key);
  }

  async addExtendedPrivateKey(extendedPrivateKey: string): Promise<void> {
    this._extKeys.push(extendedPrivateKey);
  }

  async keys(): Promise<string[]> {
    return this._wifKeys
      .map(wif => {
        return tapyrus.ECPair.fromWIF(wif, this.network).privateKey!.toString(
          'hex',
        );
      })
      .concat(
        this._extKeys.map(xpriv => {
          return tapyrus.bip32
            .fromBase58(xpriv, this.network)
            .privateKey!.toString('hex');
        }),
      );
  }

  async clear(): Promise<void> {
    this._wifKeys = [];
    this._extKeys = [];
  }
}
