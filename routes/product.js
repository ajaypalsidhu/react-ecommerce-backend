const express = require('express');

// to access the express router
const router = express.Router();
// this Router method comes from express and now we can use Router.get()/.post(), etc.

// import auth middleware
//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controllers
const { create, listAll, remove, read, update, list, 
        productsCount, productStar, listRelated, searchFilters } = require('../controllers/product');
const admin = require('../firebase');

// route 
router.get('/products/total', productsCount);
router.post('/product', authCheck, adminCheck, create);
router.get('/products/:count', listAll);
router.delete('/product/:slug', authCheck, adminCheck, remove);
router.get('/product/:slug', read);
router.put('/product/:slug', authCheck, adminCheck, update);
router.post('/products', list);
// ratings
router.put('/product/star/:productId', authCheck, productStar);
// related products
router.get('/product/related/:productId', listRelated); 
// search
router.post('/search/filters', searchFilters);

module.exports = router; 