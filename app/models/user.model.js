const mongoose = require("mongoose");

const User = mongoose.model(
  "users",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    stripe_customer_token: String,
    members: [],
    payment_method: String,
  })
);

module.exports = User;