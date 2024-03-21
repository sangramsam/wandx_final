const { MongoClient, ObjectID } = require("mongodb");

const Web3 = require("../config/web3");
const Trade = require("../models/trade");
const Basket = require("../models/basket");
const Better = require("../models/better");
const logger = require("../config/logger");

let tradeHashes = [],
  preTradeHashes = [],
  tradeRawTxns = [],
  preTradeRawTxns = [];

function refreshTradeRawTxns() {
  tradeRawTxns = [];

  Trade.find(
    {
      status: "unsent",
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        tradeRawTxns.push(res[i].sign);
      }
      preTradeRawTxns = tradeRawTxns;
      // console.log("tradeRawTxns: ", tradeRawTxns);
    }
  );
}

function refreshTradeHashes() {
  tradeHashes = [];

  Trade.find(
    {
      status: "sent",
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        tradeHashes.push(res[i].hash);
      }
      preTradeHashes = tradeHashes;
      // console.log("tradeHashes: ", tradeHashes);
    }
  );
}

let updateTradeStatus = async (statusHash, newStatus, sign) => {
  logger.info("updating trade status");
  logger.info("%s, %s, %s", statusHash, newStatus, sign);
  let doc;
  if (newStatus == "sent") {
    doc = await Trade.findOne({
      sign: sign,
    });
    if (doc) {
      doc.hash = statusHash;
    } else {
      logger.info("Trade doc with sign not found");
    }
  } else {
    if (sign) {
      doc = await Trade.findOne({
        sign: sign,
      });
    } else {
      doc = await Trade.findOne({
        hash: statusHash,
      });
    }
    let bask;
    if (newStatus == "confirmed") {
      bask = await Basket.findOneAndUpdate(
        {
          $and: [{ userAddress: doc.userAddress }, { basketID: doc.basketID }],
        },
        {
          $set: { "tokens.$[elem].tradeStatus": "confirmed" },
        },
        { arrayFilters: [{ "elem.tokenSymbol": doc.buyToken }] }
      );
    } else if (newStatus == "EVMRevert") {
      bask = await Basket.findOneAndUpdate(
        {
          $and: [{ userAddress: doc.userAddress }, { basketID: doc.basketID }],
        },
        {
          $set: {
            "tokens.$[elem].tradeStatus": "EVMRevert",
            basketCreationStatus: "EVMRevert"
          },
        },
        { arrayFilters: [{ "elem.tokenSymbol": doc.buyToken }] }
      );
    }
  }

  if (doc) {
    doc.status = newStatus;
    // console.log("Trade doc: ", doc);
    await doc.save({ _id: ObjectID(doc._id) });
  } else {
    logger.info("Trade doc not found");
  }
};

async function tradeStatusCheckAndUpdate() {
  refreshTradeHashes();
  let localHashes = preTradeHashes;
  // console.log("preTradeHashes: ", preHashes);
  // console.log("localTradeHashes: ", localHashes);
  for (let i = 0; i < localHashes.length; ++i) {
    try {
      await Web3._web3.eth.getTransactionReceipt(
        localHashes[i],
        async (err, receipt) => {
          if (err) return logger.error(new Error(err));

          if (receipt) {
            if (receipt.status == true) {
              await updateTradeStatus(localHashes[i], "confirmed", "");
            } else {
              await updateTradeStatus(localHashes[i], "EVMRevert", "");
            }
          }
        }
      );
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

async function sendTradesToBlockchain() {
  // query to get all pending tx
  let txnHash;
  refreshTradeRawTxns();
  // let localTxns = preTradeRawTxns;
  let localTxns = [];
  localTxns = preTradeRawTxns;
  // console.log("preTradeRawTxns: ", preTradeRawTxns);
  // console.log("localTradeTxns: ", localTxns);
  for (let i = 0; i < localTxns.length; ++i) {
    try {
      await Web3._web3.eth
        .sendSignedTransaction(localTxns[i])
        .once("transactionHash", async function (hash) {
          txnHash = hash;
          await updateTradeStatus(txnHash, "sent", localTxns[i]);
        })
        .once("receipt", async function (receipt) {})
        .once("confirmation", async function (confirmationNumber, receipt) {
          if (receipt.status == true) {
            await updateTradeStatus(txnHash, "confirmed", localTxns[i]);
          } else {
            await updateTradeStatus(txnHash, "EVMRevert", localTxns[i]);
          }
        })
        .on("error", async function (err, receipt) {
          setTimeout(() => {}, 1000);
          if (receipt) {
            logger.info("Contract reverted due to OUT OF GAS error!");
            logger.info(receipt);
            await updateTradeStatus(txnHash, "EVMRevert", localTxns[i]);
          }
          if (err) {
            logger.error(err);
            if (err.message == "Returned error: nonce too low") {
              updateErrorStatus(localTxns[i], "nonceTooLow");
            } else if (
              err.message ==
              "Returned error: replacement transaction underpriced"
            ) {
              updateErrorStatus(localTxns[i], "replacementTxnUnderPriced");
            } else if (
              err.message ==
              "Returned error: insufficient funds for gas * price + value"
            ) {
              updateErrorStatus(localTxns[i], "insuffETH");
            }
          }
        })
        .then(function (receipt) {
          logger.info("Trade receipt mined!");
        });
    } catch (e) {
      logger.error(e);
    }
  }
}

// function that updates nonceTooLow errored trade sign's, basket sign's, and token-in-basket's status
async function updateErrorStatus(buggySign, errMsg) {
  let bugTrade;
  if (errMsg == "nonceTooLow") {
    bugTrade = await Trade.findOneAndUpdate(
      {
        sign: buggySign,
        $or: [{ status: "unsent" }, { status: "sent" }],
      },
      {
        $set: { status: "nonceTooLow" },
      }
    );
  } else if (errMsg == "replacementTxnUnderPriced") {
    bugTrade = await Trade.findOneAndUpdate(
      {
        sign: buggySign,
        status: "sent",
      },
      {
        $set: { status: "replacementTxnUnderPriced" },
      }
    );
  } else if (errMsg == "insuffETH") {
    await Trade.findOneAndUpdate(
      {
        sign: buggySign,
        status: "unsent",
      },
      {
        $set: { status: "insuffETH" },
      }
    );
  }

  if (bugTrade) {
    await Basket.findOneAndUpdate(
      {
        userAddress: bugTrade.userAddress,
        basketID: bugTrade.basketID,
      },
      {
        $set: {
          basketCreationStatus: errMsg,
          "tokens.$[elem].tradeStatus": errMsg,
        },
      },
      { arrayFilters: [{ "elem.tokenSymbol": bugTrade.buyToken }] }
    );
  }
}

module.exports = {
  refreshTradeRawTxns,
  refreshTradeHashes,
  updateTradeStatus,
  tradeStatusCheckAndUpdate,
  sendTradesToBlockchain,
};
