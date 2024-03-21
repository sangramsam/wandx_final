const { MongoClient, ObjectID } = require("mongodb");

// const Core = require("./core");
let Web3 = require("../config/web3");
const logger = require("../config/logger");
const Trade = require("../models/trade");
const Basket = require("../models/basket");
const Better = require("../models/better");
const Constants = require("../config/constants");

let creationRawTxns = [],
  preCreationRawTxns = [],
  creationHashes = [],
  preCreationHashes = [],
  creationHashesForContract = [],
  preCreationHashesForContract = [],
  currentBlock,
  portContract;

function refreshCreationRawTxns() {
  creationRawTxns = [];
  Basket.find(
    {
      basketCreationStatus: "unsent",
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        let flag = true;
        for (let j = 0; j < res[i].tokens.length; ++j) {
          if (res[i].tokens[j].tradeStatus != "confirmed") {
            flag = false;
            break;
          }
        }
        if (flag) {
          creationRawTxns.push(res[i].basketCreationSign);
        }
      }
      preCreationRawTxns = creationRawTxns;
      // console.log("creationRawTxns: ", creationRawTxns);
    }
  );
}

function refreshCreationHashes() {
  creationHashes = [];

  Basket.find(
    {
      basketCreationStatus: "sent",
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        creationHashes.push(res[i].basketCreationHash);
      }
      preCreationHashes = creationHashes;
      // console.log("creationHashes: ", creationHashes);
    }
  );
}

function refreshCreationHashesForContract() {
  creationHashesForContract = [];

  Basket.find(
    {
      $and: [{ basketCreationStatus: "confirmed" }, { basketContract: "" }],
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        creationHashesForContract.push(res[i].basketCreationHash);
      }
      preCreationHashesForContract = creationHashesForContract;
      // console.log("creationHashesForContract: ", creationHashesForContract);
    }
  );
}

let updateCreationStatus = async (statusHash, newStatus, sign) => {
  logger.info("updating creation status");
  logger.info("%s, %s, %s", statusHash, newStatus, sign);
  let doc;
  if (newStatus == "sent") {
    doc = await Basket.findOne({
      basketCreationSign: sign,
    });
    if (doc) {
      doc.basketCreationHash = statusHash;
    } else {
      logger.info("Creation doc with sign not found");
    }
  } else {
    if (sign) {
      doc = await Basket.findOne({
        basketCreationSign: sign,
      });
    } else {
      doc = await Basket.findOne({
        basketCreationHash: statusHash,
      });
      if (newStatus == "EVMRevert") {
        await Basket.findOneAndUpdate(
          {
            basketCreationHash: statusHash,
            basketCreationStatus: "sent",
          },
          {
            $set: { basketCreationStatus: "EVMRevert" },
          }
        );
      }
    }
  }

  if (doc) {
    doc.basketCreationStatus = newStatus;
    await doc.save({ _id: ObjectID(doc._id) });
  } else {
    logger.info("Creation doc not found");
  }
};

// fetch events from blockchain, find the one with current txn hash and update the DB with this event's contract address
async function updateBasketContractAddress(txnHash) {
  // console.log("IN");
  try {
    Web3 = require("../config/web3");
    currentBlock = await Web3._web3.eth.getBlockNumber();
    portContract = new Web3.web3Socket.eth.Contract(
      Constants.createPortfolio,
      process.env.BASKET_CONTRACT
    );

    portContract.events
      .Exchange({
        fromBlock: currentBlock - process.env.BLOCKS,
        toBlock: "latest",
      })
      .on("data", async function (event) {
        if (event.transactionHash == txnHash) {
          console.log("EVENT:", event.returnValues._portfolio);
          const bask = await Basket.findOneAndUpdate(
            {
              basketCreationHash: txnHash,
            },
            {
              $set: { basketContract: event.returnValues._portfolio },
            }
          );
        }
      })
      .on("changed", function (event) {
        // remove event from local database
      })
      .on("error", function (error) {
        logger.info(
          "ERROR IN WEBSOCKET CONNECTION TO INFURA, NEED TO RESTART THE SERVER, NOT JUST REFRESH IT"
        );
        logger.error(new Error(error));
      });
  } catch (e) {
    logger.error(new Error(e));
  }
}

async function creationStatusCheckAndUpdate() {
  refreshCreationHashes();
  let localHashes = preCreationHashes;
  for (let i = 0; i < localHashes.length; ++i) {
    try {
      await Web3._web3.eth.getTransactionReceipt(
        localHashes[i],
        async (err, receipt) => {
          if (err) return logger.error(new Error(err));

          if (receipt) {
            if (receipt.status == true) {
              await updateCreationStatus(localHashes[i], "confirmed", "");
            } else {
              await updateCreationStatus(localHashes[i], "EVMRevert", "");
            }
          }
        }
      );
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

async function contractStatusCheckAndUpdate() {
  refreshCreationHashesForContract();
  let localHashes = preCreationHashesForContract;
  for (let i = 0; i < localHashes.length; ++i) {
    await updateBasketContractAddress(localHashes[i]);
  }
}

async function sendCreationRawTxns() {
  let txnHash;
  refreshCreationRawTxns();
  let localTxns = preCreationRawTxns;
  for (let i = 0; i < localTxns.length; ++i) {
    try {
      await Web3._web3.eth
        .sendSignedTransaction(localTxns[i])
        .once("transactionHash", async function (hash) {
          txnHash = hash;
          await updateCreationStatus(txnHash, "sent", localTxns[i]);
        })
        .once("receipt", async function (receipt) {})
        .once("confirmation", async function (confirmationNumber, receipt) {
          if (receipt.status == true) {
            await updateCreationStatus(txnHash, "confirmed", localTxns[i]);
            await updateBasketContractAddress(txnHash);
          } else {
            updateErrorStatus(localTxns[i], "EVMRevert");
          }
        })
        .on("error", async function (err, receipt) {
          if (receipt) {
            logger.info("EVM Revert!");
            logger.info(receipt);
            updateErrorStatus(localTxns[i], "EVMRevert");
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
          logger.info("Basket creation receipt mined!");
        });
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

async function updateErrorStatus(buggySign, errMsg) {
  if (errMsg == "EVMRevert") {
    await Basket.findOneAndUpdate(
      {
        basketCreationSign: buggySign,
        basketCreationStatus: "sent",
      },
      {
        $set: { basketCreationStatus: "EVMRevert" },
      }
    );
  } else if (errMsg == "nonceTooLow") {
    await Basket.findOneAndUpdate(
      {
        basketCreationSign: buggySign,
        $or: [
          { basketCreationStatus: "unsent" },
          { basketCreationStatus: "sent" },
        ],
      },
      {
        $set: { basketCreationStatus: "nonceTooLow" },
      }
    );
  } else if (errMsg == "replacementTxnUnderPriced") {
    await Basket.findOneAndUpdate(
      {
        basketCreationSign: buggySign,
        basketCreationStatus: "sent",
      },
      {
        $set: { basketCreationStatus: "replacementTxnUnderPriced" },
      }
    );
  } else if (errMsg == "insuffETH") {
    await Basket.findOneAndUpdate(
      {
        basketCreationSign: buggySign,
        basketCreationStatus: "unsent",
      },
      {
        $set: { basketCreationStatus: "insuffETH" },
      }
    );
  }
}

module.exports = {
  refreshCreationRawTxns,
  refreshCreationHashes,
  refreshCreationHashesForContract,
  updateCreationStatus,
  updateBasketContractAddress,
  creationStatusCheckAndUpdate,
  contractStatusCheckAndUpdate,
  sendCreationRawTxns,
};
