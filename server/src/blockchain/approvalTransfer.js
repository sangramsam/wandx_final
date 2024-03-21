const { MongoClient, ObjectID } = require("mongodb");

const Web3 = require("../config/web3");
const logger = require("../config/logger");
const Trade = require("../models/trade");
const Basket = require("../models/basket");
const Better = require("../models/better");

let rawTxns = [],
  preTxns = [],
  txnHashes = [],
  preHashes = [];

function refreshRawTxns() {
  rawTxns = [];

  Better.find(
    {
      $or: [
        {
          $and: [
            { basketCreationHash: { $ne: "" } },
            { approval_status: "unsent" },
            {
              $or: [
                { transfer_status: "unsent" },
                { transfer_status: "halted" },
              ],
            },
          ],
        },
        {
          $and: [
            { basketCreationHash: { $ne: "" } },
            { approval_status: "confirmed" },
            {
              $or: [
                { transfer_status: "unsent" },
                { transfer_status: "halted" },
              ],
            },
          ],
        },
      ],
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        if (
          res[i].approval_status == "unsent" &&
          (res[i].transfer_status == "unsent" ||
            res[i].transfer_status == "halted")
        ) {
          rawTxns.push(res[i].approval_sign);
        } else if (
          res[i].approval_status == "confirmed" &&
          (res[i].transfer_status == "unsent" ||
            res[i].transfer_status == "halted")
        ) {
          rawTxns.push(res[i].transfer_sign);
        }
      }
      preTxns = rawTxns;
      // console.log("rawTxns: ", rawTxns);
    }
  );
}

function refreshTxnHashes() {
  txnHashes = [];

  Better.find(
    {
      $or: [{ approval_status: "sent" }, { transfer_status: "sent" }],
    },
    (error, res) => {
      if (error) return logger.error(new Error(error));
      for (let i = 0; i < res.length; ++i) {
        if (res[i].approval_status == "sent") {
          txnHashes.push(res[i].approval_hash);
        } else if (res[i].transfer_status == "sent") {
          txnHashes.push(res[i].transfer_hash);
        }
      }
      preHashes = txnHashes;
      // console.log("txnHashes: ", txnHashes);
    }
  );
}

let updateStatusByHash = async (statusHash, newStatus, sign) => {
  logger.info("updating better status");
  logger.info("%s, %s, %s", statusHash, newStatus, sign);
  let doc;
  if (newStatus == "sent") {
    doc = await Better.findOne({
      $or: [{ approval_sign: sign }, { transfer_sign: sign }],
    });
    if (doc) {
      if (doc.txType == "approve") doc.approval_hash = statusHash;
      else if (doc.txType == "transfer") doc.transfer_hash = statusHash;
    } else {
      logger.info("Doc with sign not found");
    }
  } else {
    if (sign) {
      doc = await Better.findOne({
        $or: [{ approval_sign: sign }, { transfer_sign: sign }],
      });
    } else {
      doc = await Better.findOne({
        $or: [{ approval_hash: statusHash }, { transfer_hash: statusHash }],
      });
      let bugAuth, bugTrans, errMsg;
      if (newStatus == "EVMRevert") {
        errMsg = "EVMRevert";
        bugAuth = await Better.findOneAndUpdate(
          {
            approval_hash: statusHash,
            approval_status: "sent",
          },
          {
            $set: { approval_status: "EVMRevert" },
          }
        );
        bugTrans = await Better.findOneAndUpdate(
          {
            transfer_hash: statusHash,
            transfer_status: "sent",
          },
          {
            $set: { transfer_status: "EVMRevert" },
          }
        );
        // status 'halted' has to be updated for remaining status changes, and not EVMRevert
        errMsg = "halted";

        if (bugAuth) {
          await Better.updateMany(
            {
              basketCreationHash: bugAuth.basketCreationHash,
              transfer_status: "unsent",
            },
            {
              $set: { transfer_status: errMsg },
            }
          );
          await Basket.findOneAndUpdate(
            {
              basketCreationHash: bugAuth.basketCreationHash,
            },
            {
              $set: {
                "tokens.$[elem].transferStatus": errMsg,
                basketPublishStatus: errMsg,
              },
            },
            { arrayFilters: [{ "elem.amount": { $gt: 0 } }] } //an abvious condition on amount to make all transfer status as nTL,rTUP,EVMR
          );
        }
        //remaining trans updates, same for nTL, rTUP, and halted for EVMR
        if (bugTrans) {
          await Basket.findOneAndUpdate(
            {
              basketCreationHash: bugTrans.basketCreationHash,
            },
            {
              $set: {
                "tokens.$[elem].transferStatus": errMsg,
                basketPublishStatus: errMsg,
              },
            },
            { arrayFilters: [{ "elem.tokenSymbol": bugTrans.token }] }
          );
        }
      }
    }
  }

  if (doc) {
    if (doc.txType == "approve" && newStatus != "confirmed") {
      doc.approval_status = newStatus;
    } else if (doc.txType == "approve" && newStatus == "confirmed") {
      doc.approval_status = newStatus;
      doc.txType = "transfer";
      if (
        doc.transfer_status != "nonceTooLow" &&
        doc.transfer_status != "replacementTxnUnderPriced" &&
        doc.transfer_status != "insuffETH" &&
        doc.transfer_status != "EVMRevert" &&
        doc.transfer_status != "halted"
      )
        doc.transfer_status = "unsent";
    } else if (doc.txType == "transfer") {
      if (
        (doc.transfer_status == "unsent" ||
          doc.transfer_status == "nonceTooLow" ||
          doc.transfer_status == "replacementTxnUnderPriced" ||
          doc.transfer_status == "insuffETH" ||
          doc.transfer_status == "halted") &&
        doc.transfer_hash == "" &&
        newStatus == "confirmed" //handling the fake confirm on transfer case
      ) {
      } else doc.transfer_status = newStatus;
    }

    if (
      doc.transfer_status == "confirmed" &&
      doc.approval_status == "confirmed"
    ) {
      await Basket.findOneAndUpdate(
        {
          $and: [{ userAddress: doc.userAddress }, { basketID: doc.basketID }],
        },
        {
          $set: { "tokens.$[elem].transferStatus": "confirmed" },
        },
        { arrayFilters: [{ "elem.tokenSymbol": doc.token }] }
      );
    }
    await doc.save({ _id: ObjectID(doc._id) });
  } else {
    logger.info("Doc not found");
  }
};

async function statusCheckAndUpdate() {
  refreshTxnHashes();
  let localHashes = preHashes;
  for (let i = 0; i < localHashes.length; ++i) {
    try {
      await Web3._web3.eth.getTransactionReceipt(
        localHashes[i],
        async (err, receipt) => {
          if (err) return logger.error(new Error(err));

          if (receipt) {
            if (receipt.status == true) {
              await updateStatusByHash(localHashes[i], "confirmed", "");
            } else {
              await updateStatusByHash(localHashes[i], "EVMRevert", "");
            }
          }
        }
      );
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

async function sendToBlockchain() {
  // query to get all pending tx
  let txnHash;
  refreshRawTxns();
  let localTxns = preTxns;
  for (let i = 0; i < localTxns.length; ++i) {
    try {
      await Web3._web3.eth
        .sendSignedTransaction(localTxns[i])
        .once("transactionHash", async function (hash) {
          txnHash = hash;
          await updateStatusByHash(txnHash, "sent", localTxns[i]);
        })
        .once("receipt", async function (receipt) {})
        .once("confirmation", async function (confirmationNumber, receipt) {
          if (receipt.status == true) {
            await updateStatusByHash(txnHash, "confirmed", localTxns[i]);
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
          logger.info("Auth-Deposit receipt mined!");
        });
    } catch (e) {
      logger.error(new Error(e));
    }
  }
}

// function that updates nonceTooLow errored better signs', basket signs', and token-in-basket's status
async function updateErrorStatus(buggySign, errMsg) {
  let bugAuth, bugTrans;
  //personal updation: unsent, sent for nTL, ONLY sent for rTUP.
  if (errMsg == "EVMRevert") {
    //find bug Auth/Trans and personal update in one go
    bugAuth = await Better.findOneAndUpdate(
      {
        approval_sign: buggySign,
        approval_status: "sent",
      },
      {
        $set: { approval_status: "EVMRevert" },
      }
    );
    bugTrans = await Better.findOneAndUpdate(
      {
        transfer_sign: buggySign,
        transfer_status: "sent",
      },
      {
        $set: { transfer_status: "EVMRevert" },
      }
    );
    // status 'halted' has to be updated for remaining status changes, and not EVMRevert
    errMsg = "halted";
  } else if (errMsg == "nonceTooLow") {
    //find bug Auth/Trans and personal update in one go
    bugAuth = await Better.findOneAndUpdate(
      {
        approval_sign: buggySign,
        $or: [{ approval_status: "unsent" }, { approval_status: "sent" }], // for nTL, approval_status can be both unsent, sent
      },
      {
        $set: { approval_status: "nonceTooLow" },
      }
    );
    bugTrans = await Better.findOneAndUpdate(
      {
        transfer_sign: buggySign,
        $or: [{ transfer_status: "unsent" }, { transfer_status: "sent" }],
      },
      {
        $set: { transfer_status: "nonceTooLow" },
      }
    );
  } else if (errMsg == "replacementTxnUnderPriced") {
    bugAuth = await Better.findOneAndUpdate(
      {
        approval_sign: buggySign,
        approval_status: "sent", // for rTUP, approval_status can only be sent
      },
      {
        $set: { approval_status: "replacementTxnUnderPriced" },
      }
    );
    bugTrans = await Better.findOneAndUpdate(
      {
        transfer_sign: buggySign,
        transfer_status: "sent",
      },
      {
        $set: { transfer_status: "replacementTxnUnderPriced" },
      }
    );
  } else if (errMsg == "insuffETH") {
    await Better.findOneAndUpdate(
      {
        approval_sign: buggySign,
        approval_status: "unsent",
      },
      {
        $set: { approval_status: "insuffETH" },
      }
    );
    await Better.findOneAndUpdate(
      {
        transfer_sign: buggySign,
        transfer_status: "unsent",
      },
      {
        $set: { transfer_status: "insuffETH" },
      }
    );
  }
  //remaining auth updates, same for nTL and rTUP, and halted for EVMR
  if (bugAuth) {
    await Better.updateMany(
      {
        basketCreationHash: bugAuth.basketCreationHash,
        transfer_status: "unsent",
      },
      {
        $set: { transfer_status: errMsg },
      }
    );
    await Basket.findOneAndUpdate(
      {
        basketCreationHash: bugAuth.basketCreationHash,
      },
      {
        $set: {
          "tokens.$[elem].transferStatus": errMsg,
          basketPublishStatus: errMsg,
        },
      },
      { arrayFilters: [{ "elem.amount": { $gt: 0 } }] } //an abvious condition on amount to make all transfer status as nTL,rTUP,EVMR
    );
  }
  //remaining trans updates, same for nTL, rTUP, and halted for EVMR
  if (bugTrans) {
    await Basket.findOneAndUpdate(
      {
        basketCreationHash: bugTrans.basketCreationHash,
      },
      {
        $set: {
          "tokens.$[elem].transferStatus": errMsg,
          basketPublishStatus: errMsg,
        },
      },
      { arrayFilters: [{ "elem.tokenSymbol": bugTrans.token }] }
    );
  }
}

module.exports = {
  refreshRawTxns,
  refreshTxnHashes,
  updateStatusByHash,
  statusCheckAndUpdate,
  sendToBlockchain,
};
