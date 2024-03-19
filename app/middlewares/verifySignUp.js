const db = require("../models");
const User = db.user;

checkDuplicateEmail = (req, res, next) => {
  User.findOne({ email: req.body.email }).exec()
    .then(existingUser => {
      if (existingUser) {
        return res.status(400).send({ message: "You are not allowed to create multiple account using this email." });
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