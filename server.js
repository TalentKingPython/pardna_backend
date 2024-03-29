const express = require("express");
const cors = require("cors");
require('dotenv').config();

const app = express();

const router = require('./app/routes/index');

// import cronJobs
const cronJobs = require("./app/cron_services");

cronJobs.cronJobsInit()

var corsOptions = {
  origin: "*"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Pardna backend application." });
});

app.use('/api', router);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});