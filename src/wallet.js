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
const tapyrus = require('tapyrusjs-lib');
const rpc_1 = require('./rpc');
const util = require('./util');
const utxo_1 = require('./utxo');
// Wallet Implementation
class BaseWallet {
  constructor(keyStore, dataStore, config) {
    this.keyStore = keyStore;
    this.dataStore = dataStore;
    this.config = config;
    this.rpc = new rpc_1.Rpc();
  }
  importExtendedPrivateKey(xpriv) {
    return __awaiter(this, void 0, void 0, function*() {
      const restored = tapyrus.bip32.fromBase58(xpriv, this.config.network);
      const keys = yield this.keyStore.keys();
      if (util.belongsToPrivateKeys(keys, restored.privateKey)) {
        return;
      }
      this.keyStore.addExtendedPrivateKey(xpriv);
    });
  }
  importWif(wif) {
    return __awaiter(this, void 0, void 0, function*() {
      const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
      const keys = yield this.keyStore.keys();
      if (util.belongsToPrivateKeys(keys, keyPair.privateKey)) {
        return;
      }
      this.keyStore.addPrivateKey(wif);
    });
  }
  update() {
    return __awaiter(this, void 0, void 0, function*() {
      const keys = yield this.keyStore.keys();
      return Promise.all(keys.map(key => this.listUnspent(key)))
        .then(utxos => utxos.flat())
        .then(utxos => {
          this.dataStore.clear().then(() => this.dataStore.add(utxos));
        });
    });
  }
  // async broadcast(_tx: tapyrus.Transaction): Promise<string> {
  //   throw Error('Not Implemented');
  // }
  balance(colorId) {
    return __awaiter(this, void 0, void 0, function*() {
      const keys = yield this.keyStore.keys();
      return this.dataStore.balanceFor(keys, colorId);
    });
  }
  listUnspent(key) {
    return __awaiter(this, void 0, void 0, function*() {
      const [p2pkh, scripthash] = this.privateToScriptHash(
        Buffer.from(key, 'hex'),
      );
      const response = yield this.rpc.request(
        this.config,
        'blockchain.scripthash.listunspent',
        [Buffer.from(scripthash).toString('hex')],
      );
      return response.map(r => {
        if (r.color_id) {
          const cp2pkh = tapyrus.payments.cp2pkh({
            pubkey: p2pkh.pubkey,
            colorId: Buffer.from(r.color_id, 'hex'),
          });
          return new utxo_1.Utxo(
            r.tx_hash,
            r.height,
            r.tx_pos,
            cp2pkh.output.toString('hex'),
            r.color_id,
            r.value,
          );
        } else {
          return new utxo_1.Utxo(
            r.tx_hash,
            r.height,
            r.tx_pos,
            p2pkh.output.toString('hex'),
            BaseWallet.COLOR_ID_FOR_TPC,
            r.value,
          );
        }
      });
    });
  }
  // convert private key to scripthash
  privateToScriptHash(key) {
    const pair = tapyrus.ECPair.fromPrivateKey(key);
    const p2pkh = tapyrus.payments.p2pkh({
      pubkey: pair.publicKey,
    });
    return [p2pkh, tapyrus.crypto.sha256(p2pkh.output).reverse()];
  }
}
BaseWallet.COLOR_ID_FOR_TPC =
  '000000000000000000000000000000000000000000000000000000000000000000';
exports.BaseWallet = BaseWallet;
