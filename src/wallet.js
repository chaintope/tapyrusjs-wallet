'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const tslib_1 = require('tslib');
const bip39 = require('bip39');
const tapyrus = require('tapyrusjs-lib');
const local_data_store_1 = require('./data_store/local_data_store');
const local_key_store_1 = require('./key_store/local_key_store');
const rpc_1 = require('./rpc');
const signer_1 = require('./signer');
const token_1 = require('./token');
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
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const restored = tapyrus.bip32.fromBase58(xpriv, this.config.network);
      const result = yield util.belongsToPrivateKeys(
        this.keyStore,
        restored.privateKey,
      );
      if (result) {
        return;
      }
      return this.keyStore.addExtendedPrivateKey(xpriv);
    });
  }
  importWif(wif) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const keyPair = tapyrus.ECPair.fromWIF(wif, this.config.network);
      const result = yield util.belongsToPrivateKeys(
        this.keyStore,
        keyPair.privateKey,
      );
      if (result) {
        return;
      }
      return this.keyStore.addPrivateKey(wif);
    });
  }
  update() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const keys = yield this.keyStore.keys();
      return Promise.all(keys.map(key => this.listUnspent(key).catch(_r => [])))
        .then(utxos => utxos.reduce((acc, val) => acc.concat(val), []))
        .then(utxos => {
          this.dataStore.clear().then(() => this.dataStore.add(utxos));
        });
    });
  }
  broadcast(tx, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const response = yield this.rpc
        .request(
          this.config,
          'blockchain.transaction.broadcast',
          [tx.toHex()].concat((options || {}).params || []),
          (options || {}).headers,
        )
        .catch(reason => {
          throw new Error(reason);
        });
      const keys = yield this.keyStore.keys();
      yield this.dataStore.processTx(keys, tx);
      return response.toString();
    });
  }
  balance(colorId) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const keys = yield this.keyStore.keys();
      return this.dataStore.balanceFor(keys, colorId);
    });
  }
  utxos(colorId) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const keys = yield this.keyStore.keys();
      return this.dataStore.utxosFor(keys, colorId);
    });
  }
  transfer(params, changePubkeyScript, options) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const txb = new tapyrus.TransactionBuilder();
      txb.setVersion(1);
      const inputs = [];
      const uncoloredScript = tapyrus.payments.p2pkh({
        output: changePubkeyScript,
        network: this.config.network,
      });
      const coloredParams = params.filter(
        p => p.colorId !== BaseWallet.COLOR_ID_FOR_TPC,
      );
      for (const param of coloredParams) {
        const coloredUtxos = yield this.utxos(param.colorId);
        const { sum: sumToken, collected: tokens } = this.collect(
          coloredUtxos,
          param.amount,
        );
        const coloredScript = this.addressToOutput(
          param.toAddress,
          Buffer.from(param.colorId, 'hex'),
          this.config.network,
        );
        const changeColoredScript = tapyrus.payments.cp2pkh({
          hash: uncoloredScript.hash,
          colorId: Buffer.from(param.colorId, 'hex'),
          network: this.config.network,
        }).output;
        tokens.map(utxo => {
          txb.addInput(
            utxo.txid,
            utxo.index,
            undefined,
            Buffer.from(utxo.scriptPubkey, 'hex'),
          );
          inputs.push(utxo);
        });
        txb.addOutput(coloredScript, param.amount);
        txb.addOutput(changeColoredScript, sumToken - param.amount);
      }
      const uncoloredParams = params.filter(
        p => p.colorId === BaseWallet.COLOR_ID_FOR_TPC,
      );
      const uncoloredUtxos = yield this.utxos();
      const fee = this.estimatedFee(token_1.createDummyTransaction(txb));
      const tpc = uncoloredParams.reduce((sum, param) => sum + param.amount, 0);
      const { sum: sumTpc, collected: tpcs } = this.collect(
        uncoloredUtxos,
        tpc + fee,
      );
      tpcs.map(utxo => {
        txb.addInput(
          utxo.txid,
          utxo.index,
          undefined,
          Buffer.from(utxo.scriptPubkey, 'hex'),
        );
        inputs.push(utxo);
      });
      for (const param of uncoloredParams) {
        const script = this.addressToOutput(
          param.toAddress,
          Buffer.from(param.colorId, 'hex'),
          this.config.network,
        );
        txb.addOutput(script, param.amount);
      }
      txb.addOutput(uncoloredScript.output, sumTpc - tpc - fee);
      const signedTxb = yield signer_1.sign(this, txb, inputs);
      const tx = signedTxb.build();
      yield this.broadcast(tx, options);
      return tx;
    });
  }
  estimatedFee(tx) {
    return this.config.feeProvider.fee(tx);
  }
  listUnspent(key) {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
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
            network: this.config.network,
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
  // convert address to buffer of scriptPubkey
  addressToOutput(address, colorId, network) {
    if (colorId && colorId.toString('hex') !== BaseWallet.COLOR_ID_FOR_TPC) {
      try {
        return tapyrus.payments.cp2pkh({ address, network }).output;
      } catch (e) {}
      try {
        const hash = tapyrus.payments.p2pkh({ address, network }).hash;
        return tapyrus.payments.cp2pkh({ hash, colorId, network }).output;
      } catch (e) {}
    } else {
      try {
        return tapyrus.payments.p2pkh({ address, network }).output;
      } catch (e) {}
    }
    throw new Error('Invalid address type.');
  }
  collect(utxos, amount) {
    let sum = 0;
    const collected = [];
    for (const utxo of utxos) {
      sum += utxo.value;
      collected.push(utxo);
      if (sum >= amount) {
        break;
      }
    }
    if (sum >= amount) {
      return { sum, collected };
    } else {
      throw new Error('Insufficient Token');
    }
  }
}
BaseWallet.COLOR_ID_FOR_TPC =
  '000000000000000000000000000000000000000000000000000000000000000000';
exports.BaseWallet = BaseWallet;
class HDWallet extends BaseWallet {
  constructor(
    config,
    mnemonic,
    dataStore = new local_data_store_1.default(),
    keyStore,
  ) {
    const _keyStore = keyStore || new local_key_store_1.default(config.network);
    super(_keyStore, dataStore, config);
    this._mnemonic = mnemonic || bip39.generateMnemonic();
    this.addresses = [];
  }
  init() {
    return tslib_1.__awaiter(this, void 0, void 0, function*() {
      const seed = yield bip39.mnemonicToSeed(this._mnemonic);
      const node = tapyrus.bip32.fromSeed(seed);
      this._rootNode = node.derivePath(HDWallet.DerivePath);
      this._rootNode.network = this.config.network;
    });
  }
  mnemonic() {
    return this._mnemonic;
  }
  generateAddress() {
    if (!this._rootNode)
      throw Error('Not yet initialize wallet. Please call `init()` at first.');
    return this._rootNode.toWIF();
  }
}
HDWallet.DerivePath = "m/44'/2377'/0'/0/0"; // from tips-0044
exports.HDWallet = HDWallet;
