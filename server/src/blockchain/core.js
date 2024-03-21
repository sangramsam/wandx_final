const Web3 = require("../config/web3");
const Trade = require("./trade");
const Basket = require("./basketCreation");
const ApproTrans = require("./approvalTransfer");
const Publish = require("./publish");
const Constants = require("../config/constants");
const logger = require("../config/logger");

var d = new Date();
var epoch = d.getTime() / 1000;

var secondsSinceLastTimerTrigger = epoch % process.env.INTERVAL; // 60 seconds (1 minute)
var secondsUntilNextTimerTrigger =
  process.env.INTERVAL - secondsSinceLastTimerTrigger;

//hash refresh function calls on server (re)start for crashRepair() functions to have txn hashes to process
Trade.refreshTradeHashes();
Basket.refreshCreationHashes();
Basket.refreshCreationHashesForContract();
ApproTrans.refreshTxnHashes();
Publish.refreshPublishHashes();

trigger();

//server crash repair functions, called when the server (re)starts
function crashRepair() {
  Trade.tradeStatusCheckAndUpdate();
  Basket.creationStatusCheckAndUpdate();
  Basket.contractStatusCheckAndUpdate();
  ApproTrans.statusCheckAndUpdate();
  Publish.publishStatusCheckAndUpdate();
}

function trigger() {
  setTimeout(async function () {
    Trade.sendTradesToBlockchain();
    Basket.sendCreationRawTxns();
    ApproTrans.sendToBlockchain();
    Publish.sendPublishRawTxns();

    setInterval(function () {
      Trade.sendTradesToBlockchain();
      Basket.sendCreationRawTxns();
      ApproTrans.sendToBlockchain();
      Publish.sendPublishRawTxns();
      crashRepair();
    }, process.env.INTERVAL * 1000);
  }, secondsUntilNextTimerTrigger * 1000);
}
