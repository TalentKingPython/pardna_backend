//import modules
const express = require('express');

//import routers;
const auth_router = require('./auth.routes');
const user_router = require('./user.routes');
const project_router = require('./project.routes');
const stripe_router = require('./stripe.routes');

const router = express.Router();

router.use('/auth', auth_router);
router.use('/users', user_router);
router.use('/project', project_router);
router.use('/stripe', stripe_router);


module.exports = router;