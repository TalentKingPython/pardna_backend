const express = require('express');

const controller = require("../controllers/stripe.controller");

const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.post(
  '/webhook',
  controller.handleStripeWebhook
);

router.post(
  '/create-customer',
  controller.createNewCustomerOnStripe
);

router.post(
  '/create-payment-intent',
  controller.createPaymentIntentOnStripe
);

router.post(
  '/create-subscriptions-',
  controller.createSubscriptions
);

module.exports = router;