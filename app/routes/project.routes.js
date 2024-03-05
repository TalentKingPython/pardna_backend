const express = require("express");
const { authJwt } = require("../middlewares");
const controller = require("../controllers/project.controller");
const { verifyToken } = require("../middlewares/authJwt");
const router = express.Router();

router.use(function (req, res, next) {
  res.header(
    "Access-Control-Allow-Headers",
    "x-access-token, Origin, Content-Type, Accept"
  );
  next();
});

router.get("/", controller.getAllProjects);

router.get("/unmember/:projectId",
  [verifyToken],
  controller.getAllUnmembers
);

router.get("/member/:projectId",
  [verifyToken],
  controller.getAllMembers
);

router.put("/member",
  [verifyToken],
  controller.updateProjectMember
);

router.post("/",
  [verifyToken],
  controller.addNewProject
);

router.post("/addmember",
  [verifyToken],
  controller.addNewProjectMember
);

router.delete("/:id",
  [verifyToken],
  controller.deleteProject
);

module.exports = router;
