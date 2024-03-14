const mongoose = require("mongoose");

const Award = mongoose.model(
  "awards",
  new mongoose.Schema({
    customerId: String,
    projectId: String,
    awardedAt: Date,
    paidAt: Date,
    payout: {}
  })
);

module.exports = Award;