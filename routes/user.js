const express = require('express');

// to access the express router
const router = express.Router();
// this Router method comes from express and now we can use Router.get()/.post(), etc.

//middlewares
const { authCheck } = require('../middlewares/auth');

// controller
const { userCart, getUserCart, emptyCart, saveAddress,
        applyCouponToUserCart, createOrder, orders, addToWishlist, 
        wishlist, removeFromWishlist, createCashOrder } = require('../controllers/user');

// for address, cart and coupon
router.post('/user/cart', authCheck, userCart);
router.get('/user/cart', authCheck, getUserCart);
router.delete('/user/cart', authCheck, emptyCart);
router.post('/user/address', authCheck, saveAddress);
router.post('/user/cart/coupon', authCheck, applyCouponToUserCart);

// for order
router.post('/user/order', authCheck, createOrder);
router.get('/user/orders', authCheck, orders);

// for COD
router.post('/user/cash-order', authCheck, createCashOrder);

// for wishlist
router.post('/user/wishlist', authCheck, addToWishlist);
router.get('/user/wishlist', authCheck, wishlist);
router.put('/user/wishlist/:productId', authCheck, removeFromWishlist);

module.exports = router;