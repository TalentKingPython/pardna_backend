const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const dbConfig = require('../config/db.config');

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.project = require("./project.model");


db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
  })
  .catch(err => {
    console.error("Connection error", err);
    process.exit();
  });


module.exports = db;