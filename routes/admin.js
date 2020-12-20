const express = require('express');

// to access the express router
const router = express.Router();

//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

// fetch admin controllers
const { orders, orderStatus } = require('../controllers/admin');

// create routes
router.get('/admin/orders', authCheck, adminCheck, orders);
router.put('/admin/order-status', authCheck, adminCheck, orderStatus);

module.exports = router;