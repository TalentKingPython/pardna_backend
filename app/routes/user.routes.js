const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const { verifyToken, verifyAdmin } = require("../middlewares/authJwt");
const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.get("", controller.getAllUsers);

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

router.get("/admin",
  [verifyAdmin],
  controller.getAllAdminUsers
);

router.get("/tier2",
  [verifyAdmin],
  controller.getAllTier2Users
);

router.get("/tier1",
  [verifyAdmin],
  controller.getAllTier1Users
);

router.post("/roles/:userId",
  [verifyAdmin],
  controller.setUserRoles
);

module.exports = router;
