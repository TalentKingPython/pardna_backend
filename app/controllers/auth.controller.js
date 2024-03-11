const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;

const StripeControlloer = require("./stripe.controller");

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = async (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  });

  user.save().then(result => {

    const token = jwt.sign({ id: result._id },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400 // 24 hours
      });

    res.status(200).send({
      _id: result._id,
      name: result.name,
      email: result.email,
      members: result.members,
      stripe_customer_token: user.stripe_customer_token,
      authToken: token
    });
  }).catch(err => {
    if (err) {
      res.status(500).send({ message: err });
    }
  });
};

exports.signin = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    } else if(!user.roles?.length){
      return res.status(202).send({ message: "Your account is under review by Admin"})
    } else if (!user.stripe_customer_token) {
      const customer = await StripeControlloer.createCustomerProcess({ name: user.name, email: user.email });
      user.stripe_customer_token = customer.id;

      await user.save();
    }

    const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        authToken: null,
        message: "Invalid Password!"
      });
    }


    const token = jwt.sign({ id: user._id, roles: user.roles },
      config.secret,
      {
        algorithm: 'HS256',
        allowInsecureKeySizes: true,
        expiresIn: 86400
      });

    res.status(200).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      members: user.members,
      roles: user.roles,
      stripe_customer_token: user.stripe_customer_token,
      payment_method: user.payment_method,
      authToken: token
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Unexpected error occurred while logging in." });
  };
};

exports.profileInfo = async (req, res) => {
  try {
    let user = await User.findById(req.userId);
    if(!user) return res.status(404).send({message: "User not found."});
    user.authToken = req.headers["x-access-token"]
    return res.status(200).send(user)
  }catch (err) {
    return res.status(500).send({message: "Some error occurred while getting profile." + err.message})
  }
}