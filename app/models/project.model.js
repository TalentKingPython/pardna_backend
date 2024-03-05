const mongoose = require("mongoose");

const Project = mongoose.model(
  "projects",
  new mongoose.Schema({
    name: String,
    amount: String,
    number: String,
    start: Date,
    duration: String,
    members: [],
    creator: String,
    status: String,
    stripe_plan_token: String,
    paid_members: {},
  })
);

module.exports = Project;