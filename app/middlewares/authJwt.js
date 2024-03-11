const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");
const db = require("../models");

verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      req.userId = decoded.id;
      req.roles = decoded.roles;
      next();
    });
};

verifySuperAdmin = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      req.userId = decoded.id;
      req.roles = decoded.roles;

      if (!decoded.roles?.includes('superamdin'))
        return res.status(404).send({ message: 'You don\'t have Super Admin\'s permission.' })
      next();
    });
};


verifyAdmin = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      req.userId = decoded.id;
      req.roles = decoded.roles;

      if (!decoded.roles?.includes('admin'))
        return res.status(404).send({ message: 'You don\'t have Admin\'s permission.' })
      next();
    });
};


verifyTier1 = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      req.userId = decoded.id;
      req.roles = decoded.roles;

      if (!decoded.roles?.includes('tier1'))
        return res.status(404).send({ message: 'You don\'t have permission to access this api.' })
      next();
    });
};

verifyTier2 = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }

  jwt.verify(token,
    config.secret,
    (err, decoded) => {
      if (err) {
        return res.status(401).send({
          message: "Unauthorized!",
        });
      }

      req.userId = decoded.id;
      req.roles = decoded.roles;

      if (!decoded.roles?.includes('tier2'))
        return res.status(404).send({ message: 'You don\'t have permission to access this api.' })
      next();
    });
};

const authJwt = {
  verifyToken,
  verifySuperAdmin,
  verifyAdmin,
  verifyTier1,
  verifyTier2,
};

module.exports = authJwt;