const express = require("express");
const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const { verifyToken } = require("../middlewares/authJwt");
const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.post(
  "/signup",
  [
    verifySignUp.checkDuplicateEmail,
  ],
  controller.signup
);

router.post("/signin", controller.signin);

router.get("/profile",
  [verifyToken],
  controller.profileInfo
);

module.exports = router;
