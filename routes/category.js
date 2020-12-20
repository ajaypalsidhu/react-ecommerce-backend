const express = require('express');

// to access the express router
const router = express.Router();
// this Router method comes from express and now we can use Router.get()/.post(), etc.

// import auth middleware
//middlewares
const { authCheck, adminCheck } = require('../middlewares/auth');

//controllers 
const { create, read, update, remove, list, getSubs } = require('../controllers/category');

//routes
router.post('/category', authCheck, adminCheck, create);
router.get('/categories', list); // no middleware coz we want this method to be public
router.get('/category/:slug', read);
// here the slug will be grabbed as a param which we can then acess in
// controllers/categories.js by using req.params.slug
// if we had named it id, then we would use req.params.id
router.put('/category/:slug', authCheck, adminCheck, update);
router.delete('/category/:slug', authCheck, adminCheck, remove);
router.get('/category/subs/:_id', getSubs);

module.exports = router; 