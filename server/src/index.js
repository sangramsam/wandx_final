const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({
  path: path.resolve(__dirname, `./config/${process.env.ENVIRONMENT}.env`)
});

const routes = require("./routes/routes");
const logger = require("./config/logger");

require("./db/mongoose");
require("./blockchain/core");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json()); //parse incoming requests to json
app.use(routes);

app.listen(port, () => {
  logger.info("Server running on port: %d", port);
});

////////////////////////JUNK CODE, MAY BE USEFUL LATER////////////////////

// app.get("/tokensByBasketAndStatus/:id", async (req, res) => {
//   try {
//     // console.log(req);
//     let tokenArray = [];
//     const basket = await Table.findOne({
//       basketCreationHash: req.params.id
//     });
//     if (!basket) return res.status(404).send();

//     for (let i = 0; i < basket.tokens.length; ++i) {
//       //   // console.log(basket[0].tokens[token]);
//       let _token = basket.tokens[i];
//       // console.log(req.query.status);
//       if (_token.txType.status.statusName == req.query.status) {
//         tokenArray.push(_token.tokenSymbol);
//       }
//       console.log(tokenArray);
//     }
//     res.send(tokenArray);
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// app.post("/updateStatusByHash/:id", async (req, res) => {
//   try {
//     // console.log(req);
//     await updateStatusByHash(req.params.id, req.query.newStatus);
//     // if (!basket) return res.status(404).send();

//     // await basket.save({ _id: basket._id });
//     res.send({ msg: "Status successfully updated" });
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// app.post("/updateTxTypeByHash/:id", async (req, res) => {
//   try {
//     // console.log(req);
//     await updateTxType(req.params.id, req.query.newTxType);
//     // if (!basket) return res.status(404).send();

//     // await basket.save({ _id: basket._id });
//     res.send({ msg: "txType successfully updated" });
//   } catch (e) {
//     res.status(500).send(e);
//   }
// });

// updateStatusByHash(
//   "0x9944sd91a1f3acecvdfssac1cn2hjdcdkff4bxasew1c0557ef9c1c5414h23f47",
//   "confirmed"
// );

// let updateTxType = async (statusHash, newTxType) => {
//   const basket = await Basket.findOneAndUpdate(
//     {
//       "tokens.txType.status.statusHash": statusHash
//     },
//     {
//       $set: { "tokens.$[elem].txType.txTypeName": newTxType }
//     },
//     { arrayFilters: [{ "elem.txType.status.statusHash": statusHash }] }
//   );
// };

// console.log(rTxns);
// request.post(
//   `https://api.etherscan.io/api?module=proxy&action=eth_sendRawTransaction&hex=${rtxs.rtx1}&apikey=${API_KEY}`,
//   (err, res, body) => {
//     if (err) return console.log("error", err);
//     console.log("res status code: ", res.statusCode);
//     console.log("body: ", body);
//   }
// );

// if (doc.txType == "approve" && newStatus != "confirmed")
//   doc.approval_status = newStatus;
// else if (doc.txType == "approve" && newStatus == "confirmed") {
//   doc.approval_status = newStatus;
//   doc.txType = "transfer";
// } else doc.transfer_status = newStatus;

// let secondUpdate = async (statusHash, newStatus, sign) => {
//   console.log("updating second status");
//   // let doc;
//   Better.findOne(
//     {
//       $or: [
//         {
//           approval_hash: statusHash
//         },
//         {
//           transfer_hash: statusHash
//         }
//       ]
//     },
//     async function(err, doc) {
//       if (err) return console.log(err);

//       if (doc.txType == "approve" && newStatus != "confirmed")
//         doc.approval_status = newStatus;
//       else if (doc.txType == "approve" && newStatus == "confirmed") {
//         doc.approval_status = newStatus;
//         doc.txType = "transfer";
//       } else doc.transfer_status = newStatus;
//       await doc.save({ _id: ObjectID(doc._id) });
//     }
//   );
// };

// let rtxs = {
//   rtx1:
//     "0xf86921843b9aca0082520894bae664a51bf25898bc587f8a1c650bebc2ef4cf387038d7ea4c68000802ba0360f7f0ccfdb5f2cbce09b64b9d3ab8a1d7eba20fc0fb4b88f0e241d14baecb49f9727c031eb484c5eca3d862ea465c5226d77d8d6a78b00b55256d09fb6ff5a" // "0xf88384307832318b307831444344363530303088307841374438433094bae664a51bf25898bc587f8a1c650bebc2ef4cf38f307833384437454134433638303030801ba03c5c6cd3db888535e9c641df52e92b89a5bd02319383d3db17ec4d46a36af36ca03cb030d515a3caa6ac261cefa758c634bbadfeb3a2662b5e19ceaa774aaafd45"
//   // "0xf86a8086d55698372431831e848094f0109fc8df283027b6285cc889f5aa624eac1f55843b9aca008025a009ebb6ca057a0535d6186462bc0b465b561c94a295bdb0621fc19208ab149a9ca0440ffd775ce91a833ab410777204d5341a6f9fa91216a6f3ee2c051fea6a0428"
// };

// let API_KEY = "51YYUZMZYBWWYWIHFHBI9VDV9U1JHGW3IP";

// _web3.eth
//   .sendTransaction({
//     to: "0xbAe664A51Bf25898bC587F8A1C650bebC2EF4CF3",
//     from: "0x8629Bf4070c28271c4201813ADa7fc3777ff95c1",
//     value: "0x38D7EA4C68000"
//   })
//   .on("transactionHash", function(hash) {
//     txnHash = hash;
//     console.log("hash", hash);
//     // await updateStatusByHash(txnHash, "sent");
//   })
//   .on("receipt", function(receipt) {
//     console.log("receipt: ", receipt);
//     // await updateStatusByHash(txnHash, "pending");
//   })
//   .on("confirmation", function(confirmationNumber, receipt) {
//     console.log("No: ", confirmationNumber);
//     console.log("Receipt: ", receipt);
//     // await updateStatusByHash(txnHash, "confirmed");
//   })
//   .on("error", function(err, receipt) {
//     if (err) console.log("error: ", err);
//     else console.log("Err receipt", receipt);
//   });
// _web3.eth
//   .signTransaction({
//     from: "0x8629Bf4070c28271c4201813ADa7fc3777ff95c1",
//     gasPrice: "20000000000",
//     gas: "21000",
//     to: "0xbAe664A51Bf25898bC587F8A1C650bebC2EF4CF3",
//     value: "1000000000000000000",
//     data: ""
//   })
//   .then(console.log);
// }

// app.post("/sendToBC", async (req, res) => {
//   console.log("sendToBC", typeof req.body);
// let str = JSON.stringify(req.body);
// let total = Object.keys(req.body).length;
// trigger(req.body);
// sendToBlockchain(req.body)
// console.log(req.body.serializedTx);
// JSON.parse(req.body).forEach(element => {
// let txnHash;
// _web3.eth
//   .sendSignedTransaction(req.body.rtx1)
// .on("receipt", receipt => {
//   console.log(receipt, Object.keys(req.body).length);
//   console.log("receiptdata", receiptdata, receiptdata.length);
//   if (receipt["status"]) {
//     receiptdata.push(receipt);
//     //  res.send(receipt.json())
//     //res.json({"data":receipt,"status":true});
//     //res.end();
//   }
//   if (total == receiptdata.length) {
//     console.log("receiptdata", receiptdata);

//     res.json({ data: receiptdata });
//     res.end();
//   }
// })
// .on("transactionHash", async function(hash) {
//   txnHash = hash;
//   console.log("hash", hash);
// await updateStatusByHash(txnHash, "pending");
// })
// .on("receipt", async function(receipt) {
//   console.log("receipt: ", receipt);
// await updateStatusByHash(txnHash, "sent");
// })
// .on("confirmation", async function(confirmationNumber, receipt) {
//   console.log("No: ", confirmationNumber);
//   console.log("Receipt: ", receipt);
// await updateStatusByHash(txnHash, "confirmed");
// await updateTxType(txnHash, "transfer");
// })
// .on("error", function(err, receipt) {
//   if (err) console.log("error: ", err);
//   else console.log("Err receipt", receipt);
// });
// });
// });

// let updateTxType = async (statusHash, sign) => {
//   console.log("updating TxType");
//   let doc;
//   doc = await Better.findOne({
//     $or: [
//       {
//         approval_hash: statusHash
//       },
//       {
//         transfer_hash: statusHash
//       }
//     ]
//   });

//   if (doc.txType == "approve" && doc.approval_status == "confirmed") {
//     doc.txType = "transfer";
//     await doc.save({ _id: ObjectID(doc._id) });
//   }
// };

// instance.events
//   .allEvents(
//     {
//       fromBlock: 0,
//       toBlock: "latest"
//       // topics: [
//       //   "0x47e2689743f14e97f7dcfa5eec10ba1dff02f83b3d1d4b9c07b206cbbda66450"
//       // ]
//     },
//     function(error, event) {
//       console.log("event:", event);
//     }
//   )
//   .on("data", function(event) {
//     console.log(event); // same results as the optional callback above
//   })
//   .on("changed", function(event) {
//     // remove event from local database
//   })
//   .on("error", console.error);
// var subscription = _web3.eth
//   .subscribe(
//     "logs",
//     {
//       address: Constants.TestCreateContractAddress,
//       topics: [
//         "0x9bd58346ff5a5e57eeae68a4048357a336c8a9fd2683d06daf863cca7742224d"
//       ]
//     },
//     function(error, result) {
//       if (!error) console.log("SUBS RESULT:", result);
//     }
//   )
//   .on("data", function(trxData) {
//     console.log("Event received", trxData);
//     //Code from here would be run immediately when event appeared
//   });

// setTimeout(function() {
// if (bask) {
//   baskets[i]["betterSchemaData"] = "true";
//   // console.log("TYPE", baskets[i]);
// } else {
//   baskets[i]["betterSchemaData"] = "false";
// }
// console.log("bask", baskets[i]);
// }, 5000);

///////////////////////////CORE///////////////////////////

// var d = new Date();
// var epoch = d.getTime() / 1000;

// var secondsSinceLastTimerTrigger = epoch % 20; // 600 seconds (10 minutes)
// var secondsUntilNextTimerTrigger = 20 - secondsSinceLastTimerTrigger;

//hash refresh function calls on server (re)start for crashRepair() functions to have txns to process
// refreshTradeHashes();
// refreshCreationHashes();
// refreshCreationHashesForContract();
// refreshTxnHashes();
// refreshPublishHashes();

// trigger();
// crashRepair();

// //server crash repair functions, called when the server (re)starts
// function crashRepair() {
//   setTimeout(function() {
//     tradeStatusCheckAndUpdate();
//     creationStatusCheckAndUpdate();
//     contractStatusCheckAndUpdate();
//     statusCheckAndUpdate();
//     publishStatusCheckAndUpdate();
//   }, 30 * 1000);
// }

// function trigger() {
//   setTimeout(function() {
//     sendTradesToBlockchain();
//     sendCreationRawTxns();
//     sendToBlockchain();
//     sendPublishRawTxns();

//     setInterval(function() {
//       sendTradesToBlockchain();
//       sendCreationRawTxns();
//       sendToBlockchain();
//       sendPublishRawTxns();
//     }, 20 * 1000);
//   }, secondsUntilNextTimerTrigger * 1000);
// }

//////////////////////////////////////////////////////////////////

// "http://localhost:4200",
// var whitelist = [
//   "http://localhost:4200",
//   "http://192.168.1.148",
//   "http://10.10.0.144",
//   "http://10.10.0.143"
// ];

// var corsOptions = {
//   origin: function(origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
// };
