const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  userAddress: String,
  basketID: String,
  sellToken: String,
  buyToken: String,
  sign: {
    type: String,
    unique: true
  },
  status: String,
  hash: String
});

const Trade = mongoose.model("trade", tradeSchema);

module.exports = Trade;
