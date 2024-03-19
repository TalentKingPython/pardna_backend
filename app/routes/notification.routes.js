const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/notification.controller");
const { verifyToken } = require("../middlewares/authJwt");
const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});


router.get("/",
  [verifyToken],
  controller.getNotificationsByUserId
);

router.put("/:id",
  [verifyToken],
  controller.checkNotificationById
);


module.exports = router;
