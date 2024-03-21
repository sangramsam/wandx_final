const mongoose = require("mongoose");

const betterSchema = new mongoose.Schema({
  userAddress: String,
  basketID: String,
  basketCreationHash: String,
  token: String,
  txType: String,
  approval_sign: {
    type: String,
    unique: true
  },
  transfer_sign: {
    type: String,
    unique: true
  },
  approval_status: String,
  transfer_status: String,
  approval_hash: String,
  transfer_hash: String
});

const Better = mongoose.model("better", betterSchema);

module.exports = Better;
