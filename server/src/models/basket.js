const mongoose = require("mongoose");

const basketSchema = new mongoose.Schema({
  userAddress: String, // -------->> represents the user who created the basket, which can be different from currentOwner
  currentOwner: String,
  basketID: String,
  basketName: String,
  basketPrice: Number,
  basketContract: String,
  basketCreationHash: String,
  basketCreationSign: {
    type: String,
    unique: true
  },
  basketCreationStatus: String,
  basketPublishHash: String,
  basketPublishSign: String,
  basketPublishStatus: String,
  tokens: [
    {
      type: Object,
      tokenSymbol: String,
      amount: Number,
      tradeStatus: String,
      transferStatus: String
    }
  ],
  liquidated: String,
  tradable: String,
  expiresAt: Number
});

const Basket = mongoose.model("basket", basketSchema);

module.exports = Basket;
