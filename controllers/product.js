const Product = require('../models/product');
const User = require('../models/user');
const slugify = require('slugify');
const { countDocuments, aggregate } = require('../models/product');
const { use } = require('../routes/product');
const product = require('../models/product');

exports.create = async (req, res) =>{
    try{
        console.log(req.body);
        req.body.slug = slugify(req.body.title);
        const newProduct = await new Product(req.body).save();
        console.log(newProduct);
        res.json(newProduct);
    }catch (err) {
        console.log(err);
        //res.status(400).send('Create product failed - contollers/product.js');
        res.status(400).json({ err : err.message });
    }
}

exports.listAll = async (req, res) =>{
    try{
        let products = await Product.find()
        .limit(parseInt(req.params.count)) // to make sure that if we by chance get a string
        .populate('category')                        // we convert into an INT. A built-in JS function.
        .populate('subs')
        .sort([['createdAt'],['desc']])
        .exec();
        console.log(products);
        res.json(products);
    }catch (err) {
        console.log(err);
        //res.status(400).send('Create product failed - contollers/product.js');
        res.status(400).json({ err : err.message });
    }
}

exports.remove = async (req, res) => {
    try{
        const deleted = await Product.findOneAndRemove({slug : req.params.slug}).exec();
        res.json(deleted);
    }catch(err){
        console.log(err);
        return res.status(400).send('Product deletion failed - controllers/product.js');
    }
}

exports.read = async (req, res) => {
    try{
        const product = await Product.findOne({slug : req.params.slug})
            .populate('category')
            .populate('subs')
            .exec();
        res.json(product);
    }catch(err){
        console.log(err);
        return res.status(400).send('Product deletion failed - controllers/product.js');
    }
}

exports.update = async (req, res) => {
    console.log('Res data - ', req.body);
    try{
        //if you want to update the slug just uncomment this code.
        if(req.body.title){
            req.body.slug = slugify(req.body.title);
        }
        const updated = await Product.findOneAndUpdate({ slug : req.params.slug }, 
            req.body, 
            { new : true}             // { new : true } means that we want to send back the updated 
        ).exec();                    // information and not the old one.
        res.json(updated);
    }catch(err){
        console.log(err);
        //return res.status(400).send('Product updation failed - controllers/product.js');
        return res.status(400).json({ err : err.message });
    }
}

//LIST WITHOUT PAGINATION
// exports.list = async (req, res) =>{
//     try{
//         const { sort, order, limit } = req.body;
//         let products = await Product.find({})
//         .limit(parseInt(req.params.count)) // to make sure that if we by chance get a string
//         .populate('category')              // we convert into an INT. A built-in JS function.
//         .populate('subs')
//         .sort([[sort, order]])
//         .limit(limit)
//         .exec();
//         console.log(products);
//         res.json(products);
//     }catch (err) {
//         console.log(err);
//         //res.status(400).send('Create product failed - contollers/product.js');
//         res.status(400).json({ err : err.message });
//     }
// }

//LIST WITH PAGINATION
exports.list = async (req, res) =>{
    try{
        const { sort, order, page } = req.body;
        const currentPage = page || 1;
        const perPage = 3;

        const products = await Product.find({})
        .skip((currentPage - 1) * perPage)
        .limit(parseInt(req.params.count)) // to make sure that if we by chance get a string
        .populate('category')              // we convert into an INT. A built-in JS function.
        .populate('subs')
        .sort([[sort, order]])
        .limit(perPage)
        .exec();

        //console.log(products);
        res.json(products);
    }catch (err) {
        console.log(err);
        //res.status(400).send('Create product failed - contollers/product.js');
        res.status(400).json({ err : err.message });
    }
}

exports.productsCount = async (req, res) =>{
    try{
        let total = await Product.find({}).estimatedDocumentCount().exec();
        console.log(total);
        res.json(total);
    }catch (err) {
        console.log(err);
        res.status(400).json({ err : err.message });
    }
}

exports.productStar = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();
    const user = await User.findOne({email: req.user.email}).exec();
    // the User here is made available by the authCheck method in routes/product.js

    const { star } = req.body;

    // we have to make sure wether this user has already left a rating on this product
    // if he has, we update his rating else we post a new one

    let existingRatingObject = product.ratings.find(ele => 
        ele.postedBy.toString() === user._id.toString()
    );
    // which ever of the returned ratings is left by this user will be put in the variable
    // if none matches, the variable will be undefined

    if(existingRatingObject === undefined){
        let ratingAdded = await Product.findByIdAndUpdate(product._id, {
            $push : { ratings : { star : star, postedBy : user._id } } // mongoose command
            },
            { new : true }
        ).exec();
        // find the product by id and push in the new rating
        res.json(ratingAdded);
    }
    else {
        let ratingUpdated = await Product.updateOne(
            { ratings : { $elemMatch : existingRatingObject } },
            { $set : { "ratings.$.star" : star } },
            { new : true}
        ).exec();
        res.json(ratingUpdated);
    }
}

exports.listRelated = async (req, res) => {
    const product = await Product.findById(req.params.productId).exec();

    const related = await Product.find({
        _id : { $ne : product._id},  //mongoose function - ne stands for not including
        category : product.category
    })
    .limit(3)
    .populate('category')
    .populate('subs')
    .populate('postedBy')
    .exec();

    res.json(related);
}

exports.searchFilters = async (req, res) => {
    const { query, price, category, stars, sub, shipping, color, brand } = req.body;
    if(query) {
        await handleQuery(req, res, query);
    }
    if(price !== undefined) {
        await handlePrice(req, res, price);
    }
    if(category) {
        await handleCategory(req, res, category);
    }
    if(stars) {
        await handleStar(req, res, stars);
    }
    if(sub) {
        await handleSub(req, res, sub);
    }
    if(shipping) {
        await handleShipping(req, res, shipping);
    }
    if(color) {
        await handleColor(req, res, color);
    }
    if(brand) {
        await handleBrand(req, res, brand);
    }
}

const handleQuery = async (req, res, query) => {
    const products = await Product.find({ $text : { $search : query }})
    .populate('category', '_id name')
    .populate('subs', '_id name')
    .populate('postedBy', '_id name')
    .exec();

    res.json(products);
}

const handlePrice = async (req, res,price) =>{
    try {
        let products = await product.find({
            price :{
                $gte : price[0],
                $lte : price[1]
            }
        })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();
        res.json(products);
        }
    catch (err) {
        console.log(err);
    }
}

const handleCategory = async (req, res, category) => {
    try{
        let products = await Product.find({category : category})
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec();
            res.json(products);
    }
    catch (err) {
        console.log(err);
    }
}

const handleStar =  (req, res, stars) => {
    Product.aggregate([
        {
            $project : {
                document : '$$ROOT',
                floorAverage : {
                    $floor : { $avg : '$ratings.star'} // Mongoose mthd to cal average
                }
            }
        },
        { $match : { floorAverage : stars }}  // ----> 1  <-----
    ])
    .limit(12)
    .exec((err, aggregates) => {
        if(err) console.log('Aggregare error - ', err);
        Product.find({ _id : aggregates })
            .populate('category', '_id name')
            .populate('subs', '_id name')
            .populate('postedBy', '_id name')
            .exec((err, products) => {
                if (err) console.log('Product Aggregare error - ', err);
                res.json(products);
            });
    });
    
    
}

// ----> 1  <-----
// Mongoose method to match the requested star rating with the one averaged just above. If the 
// average matches with the requested rating we will sedn this product to the front end.
// ----> 1  <-----

const handleSub = async (req,res, sub) => {
    const products = await Product.find({ subs : sub})
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();
    res.json(products);
}

const handleShipping = async (req, res, shipping) => {
    const products = await Product.find({ shipping })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();
    res.json(products);
}

const handleColor = async (req, res, color) => {
    const products = await Product.find({ color })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();
    res.json(products);
}

const handleBrand = async (req, res, brand) => {
    const products = await Product.find({ brand })
        .populate('category', '_id name')
        .populate('subs', '_id name')
        .populate('postedBy', '_id name')
        .exec();
    res.json(products);
}