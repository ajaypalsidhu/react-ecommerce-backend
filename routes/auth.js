const express = require('express');

// to access the express router
const router = express.Router();
// this Router method comes from express and now we can use Router.get()/.post(), etc.

// import auth middleware
//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controllers
const { createOrUpdateUser, currentUser } = require('../controllers/auth');

router.post('/create-or-update-user', authCheck, createOrUpdateUser);
router.post('/current-user', authCheck, currentUser);
router.post('/current-admin', authCheck, adminCheck, currentUser);

module.exports = router; 