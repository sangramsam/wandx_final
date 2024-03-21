const express = require("express");
const Basket = require("../models/basket");
const Better = require("../models/better");
const Trade = require("../models/trade");
const q = require("q");
const logger = require("../config/logger");

const router = new express.Router();

// router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.json()); //parse incoming requests to json

router.post("/addBasket", async (req, res) => {
  try {
    const basket = req.body;
    if (
      !basket ||
      !basket.userAddress ||
      !basket.currentOwner ||
      basket.userAddress !== basket.currentOwner ||
      basket.basketID <= 0 ||
      !basket.basketName ||
      basket.basketPrice < 0 ||
      basket.basketContract ||
      basket.basketCreationHash ||
      !basket.basketCreationSign ||
      basket.basketCreationStatus !== "unsent" ||
      basket.basketPublishHash ||
      basket.basketPublishSign ||
      basket.basketPublishStatus !== "unsent" ||
      basket.liquidated != "no" ||
      basket.tradable != "true" ||
      basket.expiresAt <= 0 ||
      basket.tokens.length === 0
    ) {
      logger.info("Invalid basket object");
      return res.status(400).send("Invalid basket object");
    }
    for (let i = 0; i < basket.tokens.length; ++i) {
      if (
        !basket.tokens[i].tokenSymbol ||
        basket.tokens[i].amount <= 0 ||
        (basket.tokens[i].tradeStatus !== "unsent" &&
          basket.tokens[i].tradeStatus !== "confirmed") ||
        basket.tokens[i].transferStatus !== "unsent"
      ) {
        logger.info("Invalid basket object");
        return res.status(400).send("Invalid basket object");
      }
    }
    const bask = new Basket(basket);
    await bask.save();
    res.status(201).send(bask);
  } catch (e) {
    logger.error(new Error(e));
    res.status(500).send(e);
  }
});

router.post("/addTrade", async (req, res) => {
  try {
    const basket = req.body;
    if (!basket || !basket.userAddress || basket.tokens.length === 0) {
      logger.info("Invalid trade object");
      return res.status(400).send("Invalid trade object");
    }
    let serverResponse = [];
    for (let i = 0; i < basket.tokens.length; ++i) {
      let field = {
        userAddress: "",
        basketID: "",
        sellToken: "",
        buyToken: "",
        sign: "",
        status: "",
        hash: "",
      };

      if (
        !basket.tokens[i].buyToken ||
        !basket.tokens[i].sellToken ||
        basket.tokens[i].buyToken == basket.tokens[i].sellToken ||
        !basket.tokens[i].sign ||
        basket.tokens[i].status !== "unsent" ||
        basket.tokens[i].hash
      ) {
        logger.info("Invalid trade object");
        res.status(400).send("Invalid trade object");
      } else {
        field.userAddress = basket.userAddress;
        field.basketID = basket.basketID;
        field.sellToken = basket.tokens[i].sellToken;
        field.buyToken = basket.tokens[i].buyToken;
        field.sign = basket.tokens[i].sign;
        field.status = basket.tokens[i].status;
        field.hash = basket.tokens[i].hash;

        field = new Trade(field);
        await field.save();
        serverResponse.push(field);
      }
    }
    res.status(201).send(serverResponse);
  } catch (e) {
    logger.error(new Error(e));
    res.status(500).send(e);
  }
});

router.post("/addBetterBasket", async (req, res) => {
  try {
    const basket = req.body;
    let serverResponse = [];

    if (
      !basket ||
      !basket.userAddress ||
      basket.basketID <= 0 ||
      !basket.basketCreationHash ||
      basket.tokens.length === 0
    ) {
      logger.info("Invalid better object");
      return res.status(400).send("Invalid approve-transfer object");
    }

    for (let i = 0; i < basket.tokens.length; ++i) {
      let field = {
        userAddress: "",
        basketID: "",
        basketCreationHash: "",
        token: "",
        txType: "",
        approval_sign: "",
        transfer_sign: "",
        approval_status: "",
        transfer_status: "",
        approval_hash: "",
        transfer_hash: "",
      };

      if (
        !basket.tokens[i].token ||
        basket.tokens[i].txType !== "approve" ||
        !basket.tokens[i].approval_sign ||
        !basket.tokens[i].transfer_sign ||
        basket.tokens[i].approval_status !== "unsent" ||
        basket.tokens[i].transfer_status !== "unsent" ||
        basket.tokens[i].approval_hash ||
        basket.tokens[i].transfer_hash
      ) {
        logger.info("Invalid better object");
        res.status(400).send("Invalid approve-transfer object");
      } else {
        field.userAddress = basket.userAddress;
        field.basketID = basket.basketID;
        field.basketCreationHash = basket.basketCreationHash;
        field.token = basket.tokens[i].token;
        field.txType = basket.tokens[i].txType;
        field.approval_sign = basket.tokens[i].approval_sign;
        field.transfer_sign = basket.tokens[i].transfer_sign;
        field.approval_status = basket.tokens[i].approval_status;
        field.transfer_status = basket.tokens[i].transfer_status;
        field.approval_hash = basket.tokens[i].approval_hash;
        field.transfer_hash = basket.tokens[i].transfer_hash;

        let existing = await Better.find({
          userAddress: basket.userAddress,
          basketID: basket.basketID,
          token: basket.tokens[i].token,
        });
        if (existing.length == 0) {
          field = new Better(field);
          await field.save();
          serverResponse.push(field);
        } else {
          res
            .status(400)
            .send({ msg: "Cannot put the same token twice in the basket" });
        }
      }
    }
    res.status(201).send(serverResponse);
  } catch (e) {
    logger.error(new Error(e));
    res.status(500).send(e);
  }
});

router.post("/addPublishSign/", async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.basketCreationHash ||
      !req.body.basketPublishSign
    ) {
      logger.info("Invalid addPublishSign object");
      return res.status(400).send("Invalid addPublishSign object");
    }
    const bask = await Basket.findOneAndUpdate(
      {
        basketCreationHash: req.body.basketCreationHash,
      },
      {
        $set: { basketPublishSign: req.body.basketPublishSign },
      }
    );
    if (!bask) return res.status(404).send({ msg: "Basket not found!" });
    res.status(200).send({ msg: "Publish sign added/updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/updateLiquidationStatus/", async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.basketContract ||
      req.body.liquidated !== "yes"
    ) {
      logger.info("Invalid updateLiquidationStatus object");
      res.status(400).send("Invalid updateLiquidationStatus object");
    } else {
      const bask = await Basket.findOneAndUpdate(
        {
          basketContract: req.body.basketContract,
        },
        {
          $set: { liquidated: req.body.liquidated },
        }
      );
      res.status(200).send({ msg: "Liquidation status updated" });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/updateCurrentOwner/", async (req, res) => {
  try {
    if (!req.body || !req.body.basketContract || !req.body.newOwner) {
      logger.info("Invalid updateCurrentOwner object");
      res.status(400).send("Invalid updateCurrentOwner object");
    } else {
      const bask = await Basket.findOneAndUpdate(
        {
          basketContract: req.body.basketContract,
        },
        {
          $set: { currentOwner: req.body.newOwner },
        }
      );
      res.status(200).send({ msg: "Current owner updated" });
    }
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/updateTradeSigns/", async (req, res) => {
  try {
    let obj = req.body;
    // validation
    if (!obj || !obj.userAddress || !obj.basketID) {
      logger.info("Invalid updateTradeSigns object");
      return res.status(400).send("Invalid updateTradeSigns object");
    }
    for (let i = 0; i < obj.tokens.length; ++i) {
      if (!obj.tokens[i].buyToken || !obj.tokens[i].sign) {
        logger.info("Invalid updateTradeSigns object");
        return res.status(400).send("Invalid updateTradeSigns object");
      }
    }
    const bask = await Trade.findOne({
      userAddress: obj.userAddress,
      basketID: obj.basketID,
    });
    if (!bask) return res.status(404).send({ msg: "Trade object not found!" });
    // sign update logic
    for (let i = 0; i < obj.tokens.length; ++i) {
      await Trade.findOneAndUpdate(
        {
          userAddress: obj.userAddress,
          basketID: obj.basketID,
          buyToken: obj.tokens[i].buyToken,
        },
        {
          $set: { sign: obj.tokens[i].sign, status: "unsent", hash: "" },
        }
      );
    }
    res.status(200).send({ msg: "Trade sign(s) updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/updateBasketSign/", async (req, res) => {
  try {
    let obj = req.body;
    if (!obj || !obj.userAddress || !obj.basketID || !obj.basketCreationSign) {
      logger.info("Invalid updateBasketSign object");
      return res.status(400).send("Invalid updateBasketSign object");
    }
    const bask = await Basket.findOneAndUpdate(
      {
        userAddress: obj.userAddress,
        basketID: obj.basketID,
      },
      {
        $set: {
          basketCreationSign: obj.basketCreationSign,
          basketCreationStatus: "unsent",
          basketCreationHash: "",
        },
      }
    );
    if (!bask) return res.status(404).send({ msg: "Basket not found!" });
    res.status(200).send({ msg: "Basket creation sign updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

// update authorization, deposit signs. Only that sign updates, which is NOT NULL in req body array
router.post("/updateAuthDepoSigns/", async (req, res) => {
  try {
    let obj = req.body;
    // validation
    if (!obj || !obj.userAddress || !obj.basketID) {
      logger.info("Invalid updateAuthDepoSigns object");
      return res.status(400).send("Invalid updateAuthDepoSigns object");
    }
    for (let i = 0; i < obj.tokens.length; ++i) {
      if (
        !obj.tokens[i].token ||
        (!obj.tokens[i].approval_sign && !obj.tokens[i].transfer_sign)
      ) {
        logger.info("Invalid updateAuthDepoSigns object");
        return res.status(400).send("Invalid updateAuthDepoSigns object");
      }
    }
    const bask = await Better.findOne({
      userAddress: obj.userAddress,
      basketID: obj.basketID,
    });
    if (!bask)
      return res
        .status(404)
        .send({ msg: "Auth-deposit/Better object not found!" });
    //sign update logic
    for (let i = 0; i < obj.tokens.length; ++i) {
      if (obj.tokens[i].approval_sign && !obj.tokens[i].transfer_sign) {
        await Better.findOneAndUpdate(
          {
            userAddress: obj.userAddress,
            basketID: obj.basketID,
            token: obj.tokens[i].token,
          },
          {
            $set: {
              approval_sign: obj.tokens[i].approval_sign,
              approval_status: "unsent",
              approval_hash: "",
            },
          }
        );
      } else if (!obj.tokens[i].approval_sign && obj.tokens[i].transfer_sign) {
        await Better.findOneAndUpdate(
          {
            userAddress: obj.userAddress,
            basketID: obj.basketID,
            token: obj.tokens[i].token,
          },
          {
            $set: {
              transfer_sign: obj.tokens[i].transfer_sign,
              transfer_status: "unsent",
              transfer_hash: "",
            },
          }
        );
      } else if (obj.tokens[i].approval_sign && obj.tokens[i].transfer_sign) {
        await Better.findOneAndUpdate(
          {
            userAddress: obj.userAddress,
            basketID: obj.basketID,
            token: obj.tokens[i].token,
          },
          {
            $set: {
              approval_sign: obj.tokens[i].approval_sign,
              transfer_sign: obj.tokens[i].transfer_sign,
              approval_status: "unsent",
              transfer_status: "unsent",
              approval_hash: "",
              transfer_hash: "",
            },
          }
        );
      }
    }
    res.status(200).send({ msg: "Auth-Deposit sign(s) updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

// change publish sign AND ALSO its status
router.post("/updatePublishSign/", async (req, res) => {
  try {
    if (
      !req.body ||
      !req.body.basketCreationHash ||
      !req.body.basketPublishSign
    ) {
      logger.info("Invalid addPublishSign object");
      return res.status(400).send("Invalid addPublishSign object");
    }
    const bask = await Basket.findOneAndUpdate(
      {
        basketCreationHash: req.body.basketCreationHash,
      },
      {
        $set: {
          basketPublishSign: req.body.basketPublishSign,
          basketPublishStatus: "unsent",
          basketPublishHash: "",
        },
      }
    );
    if (!bask) return res.status(404).send({ msg: "Basket not found!" });
    res.status(200).send({ msg: "Publish sign added/updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/updateTradeWithoutBasketSign/", async (req, res) => {
  try {
    let obj = req.body;
    // validation
    if (!obj || !obj.sign || !obj.newSign) {
      logger.info("Invalid updateTradeWithoutBasketSign object");
      return res
        .status(400)
        .send("Invalid updateTradeWithoutBasketSign object");
    }
    // sign update logic
    const trade = await Trade.findOneAndUpdate(
      { sign: obj.sign },
      { $set: { sign: obj.newSign, status: "unsent", hash: "" } }
    );
    if (!trade)
      return res
        .status(404)
        .send({ msg: "TradeWithoutBasket object not found!" });
    res.status(200).send({ msg: "TradeWithoutBasket sign updated" });
  } catch (e) {
    res.status(500).send(e);
  }
});

// change insuffETH status to unsent
router.post("/updateInsuffETHStatus/", async (req, res) => {
  try {
    let obj = req.body;
    // validation
    if (!obj || !obj.sign || !obj.collection) {
      logger.info("Invalid updateInsuffETHStatus object");
      return res.status(400).send("Invalid updateInsuffETHStatus object");
    }
    // sign update logic
    let result;
    if (obj.collection == "trade") {
      result = await Trade.findOneAndUpdate(
        {
          sign: obj.sign,
          status: "insuffETH",
        },
        {
          $set: { status: "unsent" },
        }
      );
    } else if (obj.collection == "basketCreation") {
      result = await Basket.findOneAndUpdate(
        {
          basketCreationSign: obj.sign,
          basketCreationStatus: "insuffETH",
        },
        {
          $set: { basketCreationStatus: "unsent" },
        }
      );
    } else if (obj.collection == "approval") {
      result = await Better.findOneAndUpdate(
        {
          approval_sign: obj.sign,
          approval_status: "insuffETH",
        },
        {
          $set: { approval_status: "unsent" },
        }
      );
    } else if (obj.collection == "transfer") {
      result = await Better.findOneAndUpdate(
        {
          transfer_sign: obj.sign,
          transfer_status: "insuffETH",
        },
        {
          $set: { transfer_status: "unsent" },
        }
      );
    } else if (obj.collection == "publish") {
      result = await Basket.findOneAndUpdate(
        {
          basketPublishSign: obj.sign,
          basketPublishStatus: "insuffETH",
        },
        {
          $set: { basketPublishStatus: "unsent" },
        }
      );
    }

    if (!result)
      return res.status(404).send({ msg: "Collection object not found!" });
    res.status(200).send({ msg: "InsuffETH status updated!" });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/basketsByUser/:id", async (req, res) => {
  try {
    const baskets = await Basket.find({
      userAddress: req.params.id,
    });
    if (baskets.length == 0)
      return res.status(404).send({ msg: "No baskets found for this user!" });
    res.status(200).send(baskets);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/myTokenBaskets/:id", async (req, res) => {
  try {
    let bask = [];
    let statuses = [];
    let baskets = await Basket.find({
      currentOwner: req.params.id,
    });
    if (baskets.length == 0)
      return res.status(404).send({ msg: "No baskets found for this user!" });
    for (let i = 0; i < baskets.length; ++i) {
      bask.push(
        await Better.find({
          basketCreationHash: baskets[i].basketCreationHash,
        })
      );
    }
    q.all(bask).then(function (result) {
      for (let j = 0; j < result.length; ++j) {
        if (result[j].length != 0) {
          statuses.push("true");
          // console.log("TYPE", statuses);
        } else {
          statuses.push("false");
        }
      }
      res
        .status(200)
        .send({ baskets: baskets, betterDataExistanceArray: statuses });
    });
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tokenBasketsNotMine/:id", async (req, res) => {
  try {
    const bask = await Basket.find({
      $and: [
        { currentOwner: { $ne: req.params.id } },
        { $expr: { $eq: ["$userAddress", "$currentOwner"] } },
        { basketPublishStatus: "confirmed" },
        { liquidated: "no" },
      ],
    });
    res.status(200).send(bask);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/basketContractByPair/", async (req, res) => {
  try {
    const basket = await Basket.findOne({
      userAddress: req.query.userAddress,
      basketID: req.query.basketID,
    });
    if (!basket) return res.status(404).send();
    res.status(200).send(basket);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/allData/", async (req, res) => {
  try {
    let trades = await Trade.find({
      userAddress: req.query.userAddress,
      basketID: req.query.basketID,
    });
    let basket = await Basket.findOne({
      userAddress: req.query.userAddress,
      basketID: req.query.basketID,
    });
    let betters = await Better.find({
      userAddress: req.query.userAddress,
      basketID: req.query.basketID,
    });

    let all = {
      trades,
      basket,
      betters,
    };
    if (!basket) return res.status(404).send({ msg: "Basket not found!" });
    res.status(200).send(all);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tradesWithoutBasket/", async (req, res) => {
  try {
    let trades = await Trade.find({
      userAddress: req.query.userAddress,
      basketID: -1,
      status: { $ne: "confirmed" },
    });
    if (trades.length == 0)
      return res
        .status(404)
        .send({ msg: "TradesWithoutBasket object(s) not found!" });
    res.status(200).send(trades);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/basketByID/:id", async (req, res) => {
  try {
    const basket = await Basket.find({
      basketCreationHash: req.params.id,
    });
    if (!basket) return res.status(404).send();
    res.status(200).send(basket);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/tradingTokensByUser/:id", async (req, res) => {
  try {
    const trades = await Trade.find({
      userAddress: req.params.id,
    });
    if (trades.length == 0) return res.status(404).send();
    res.status(200).send(trades);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
