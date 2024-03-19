const mongoose = require("mongoose");

const Notification = mongoose.model(
  "notifications",
  new mongoose.Schema({
    userId: String,
    title: String,
    content: String,
    status: String
  })
);

module.exports = Notification;