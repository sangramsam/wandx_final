const { MongoClient, ObjectID } = require("mongodb");

const Web3 = require("../config/web3");
const logger = require("../config/logger");
const Trade = require("../models/trade");
const Basket = require("../models/basket");
const Better = require("../models/better");

let pubRawTxns = [],
  prePubRawTxns = [],
  pubHashes = [],
  prePubHashes = [];

function refreshPublishRawTxns() {
  pubRawTxns = [];

  Basket.find(
    {
      $or: [
        { basketPublishStatus: "unsent" },
        { basketPublishStatus: "halted" },
      ],
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        let flag = true;
        for (let j = 0; j < res[i].tokens.length; ++j) {
          if (res[i].tokens[j].transferStatus != "confirmed") {
            flag = false;
            break;
          }
        }
        if (flag) {
          pubRawTxns.push(res[i].basketPublishSign);
        }
      }
      prePubRawTxns = pubRawTxns;
      // console.log("pubRawTxns: ", pubRawTxns);
    }
  );
}

function refreshPublishHashes() {
  pubHashes = [];

  Basket.find(
    {
      basketPublishStatus: "sent",
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        pubHashes.push(res[i].basketPublishHash);
      }
      prePubHashes = pubHashes;
      // console.log("pubHashes: ", pubHashes);
    }
  );
}

let updatePublishStatus = async (statusHash, newStatus, sign) => {
  logger.info("updating publish status");
  logger.info("%s, %s, %s", statusHash, newStatus, sign);
  let doc;
  if (newStatus == "sent") {
    doc = await Basket.findOne({
      basketPublishSign: sign,
    });
    if (doc) {
      doc.basketPublishHash = statusHash;
    } else {
      logger.info("Publish doc with sign not found");
    }
  } else {
    if (sign) {
      doc = await Basket.findOne({
        basketPublishSign: sign,
      });
    } else {
      doc = await Basket.findOne({
        basketPublishHash: statusHash,
      });
      if (newStatus == "EVMRevert") {
        await Basket.findOneAndUpdate(
          {
            basketPublishHash: statusHash,
            basketPublishStatus: "sent",
          },
          {
            $set: { basketPublishStatus: "EVMRevert" },
          }
        );
      }
    }
  }

  if (doc) {
    doc.basketPublishStatus = newStatus;
    await doc.save({ _id: ObjectID(doc._id) });
  } else {
    logger.info("Publish doc not found");
  }
};

async function publishStatusCheckAndUpdate() {
  refreshPublishHashes();
  let localHashes = prePubHashes;
  for (let i = 0; i < localHashes.length; ++i) {
    try {
      await Web3._web3.eth.getTransactionReceipt(
        localHashes[i],
        async (err, receipt) => {
          if (err) return logger.error(new Error(err));

          if (receipt) {
            if (receipt.status == true) {
              await updatePublishStatus(localHashes[i], "confirmed", "");
            } else {
              await updatePublishStatus(localHashes[i], "EVMRevert", "");
            }
          }
        }
      );
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

async function sendPublishRawTxns() {
  let txnHash;
  refreshPublishRawTxns();
  let localTxns = prePubRawTxns;
  for (let i = 0; i < localTxns.length; ++i) {
    try {
      await Web3._web3.eth
        .sendSignedTransaction(localTxns[i])
        .once("transactionHash", async function (hash) {
          txnHash = hash;
          await updatePublishStatus(txnHash, "sent", localTxns[i]);
        })
        .once("receipt", async function (receipt) {})
        .once("confirmation", async function (confirmationNumber, receipt) {
          if (receipt.status == true) {
            await updatePublishStatus(txnHash, "confirmed", localTxns[i]);
          } else {
            updateErrorStatus(localTxns[i], "EVMRevert");
          }
        })
        .on("error", function (err, receipt) {
          if (receipt) {
            logger.info("EVM Revert!");
            logger.info(receipt);
            updateErrorStatus(localTxns[i], "EVMRevert");
          }
          if (err) {
            let bug = new Error(err);
            logger.error(bug);
            if (bug.message == "Error: Returned error: nonce too low") {
              updateErrorStatus(localTxns[i], "nonceTooLow");
            } else if (
              bug.message ==
              "Error: Returned error: replacement transaction underpriced"
            ) {
              updateErrorStatus(localTxns[i], "replacementTxnUnderPriced");
            } else if (
              bug.message ==
              "Error: Returned error: insufficient funds for gas * price + value"
            ) {
              updateErrorStatus(localTxns[i], "insuffETH");
            }
          }
        })
        .then(function (receipt) {
          logger.info("Publish receipt mined!");
        });
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

// function that updates nonceTooLow errored trade sign's, basket sign's, and token-in-basket's status
async function updateErrorStatus(buggySign, errMsg) {
  if (errMsg == "EVMRevert") {
    await Basket.findOneAndUpdate(
      {
        basketPublishSign: buggySign,
        basketPublishStatus: "sent",
      },
      {
        $set: { basketPublishStatus: "EVMRevert" },
      }
    );
  } else if (errMsg == "nonceTooLow") {
    await Basket.findOneAndUpdate(
      {
        basketPublishSign: buggySign,
        $or: [
          { basketPublishStatus: "unsent" },
          { basketPublishStatus: "sent" }, //for genuine nonceTooLow
        ],
      },
      {
        $set: { basketPublishStatus: "nonceTooLow" },
      }
    );
  } else if (errMsg == "replacementTxnUnderPriced") {
    await Basket.findOneAndUpdate(
      {
        basketPublishSign: buggySign,
        basketPublishStatus: "sent", //only sent for genuine replacementTxnUnderPriced
      },
      {
        $set: { basketPublishStatus: "replacementTxnUnderPriced" },
      }
    );
  } else if (errMsg == "insuffETH") {
    await Basket.findOneAndUpdate(
      {
        basketPublishSign: buggySign,
        basketPublishStatus: "unsent",
      },
      {
        $set: { basketPublishStatus: "insuffETH" },
      }
    );
  }
}

module.exports = {
  refreshPublishRawTxns,
  refreshPublishHashes,
  updatePublishStatus,
  publishStatusCheckAndUpdate,
  sendPublishRawTxns,
};
