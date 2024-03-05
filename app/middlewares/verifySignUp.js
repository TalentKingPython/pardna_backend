const db = require("../models");
const ROLES = db.ROLES;
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec()
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).send({ message: "Failed! Email is already in use!" });
      }

      next()
    })
    .catch(err => {
      return res.status(500).send({ message: err.message || "Some error occurred while checking user data." });
    });
};


const verifySignUp = {
  checkDuplicateEmail,
};

module.exports = verifySignUp;