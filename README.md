# Tapyrus Wallet for Javascript

## Install

```
npm install chaintope/tapyrusjs-wallet
```

## Usage

### Cordova Plugin

Use `KeyStore.CordovaKeyStore` and `DataStore.CordovaDataStore`

```javascript

const tapyrus = require("tapyrusjs-lib");
const wallet = require("tapyrusjs-wallet");
const keyStore = new wallet.KeyStore.CordovaKeyStore();
const dataStore = new wallet.DataStore.CordovaDataStore();
const config = new wallet.Config({schema: "http", host: "example.org", port: "3000", path: "/", network: "dev"});

const alice = new wallet.Wallet.BaseWallet(keyStore, dataStore, config);

await alice.importExtendedPrivateKey("tprv8ZgxMBicQKsPd7Uf69XL1XwhmjHopUGep8GuEiJDZmbQz6o58LninorQAfcKZWARbtRtfnLcJ5MQ2AtHcQJCCRUcMRvmDUjyEmNUWwx8UbK");

// Synchronize utxos with the index server
await alice.update();

const colorId = Buffer.from("c3ec2fd806701a3f55808cbec3922c38dafaa3070c48c803e9043ee3642c660b46", "hex");
const balance = await alice.balance(colorId);

console.log(balance);
```
