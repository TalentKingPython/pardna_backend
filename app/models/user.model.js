const mongoose = require("mongoose");

const User = mongoose.model(
  "users",
  new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    roles: [],
    stripe_customer_token: String,
    members: [],
    status: String,
    payment_method: String,
  })
);

module.exports = User;