const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/authJwt");
const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.get("/all", controller.allAccess);

router.get("/unmember",
  [verifyToken],
  controller.getAllUnmembers
);

router.post("/members",
  [verifyToken],
  controller.getAllTeamMembers
);

router.get("/addmember",
  [verifyToken],
  controller.addTeamMember
);

module.exports = router;
