const Category = require('../models/categories');
const Sub = require('../models/sub');
const Product = require('../models/product');
const slugify = require('slugify');

exports.create = async (req, res) =>{
    try{
        const {name} = req.body;
        const category = await new Category({ name, slug:  slugify(name) }).save();
        //console.log(category);
        res.json(category);
    }catch (err) {
        console.log(err);
        res.status(400).send('Create category failed');
    }
}

exports.list = async (req, res) =>{
    const cats = await Category.find({}).sort({createdAt : -1}).exec();
    res.json(cats);
    //res.json(await Category.find({}).sort({createdAt : -1}).exec());
    console.log("Cats from controllers/category.js - ", cats);
}

exports.read = async (req, res) =>{
    let category = await Category.findOne({ slug : req.params.slug }).exec();
    
    const products = await Product.find({ category : category })
        .populate('category')
        .exec();

    res.json({ 
        category,
        products
    }); // in the front end we can access these by res.data.category and res.data.products
}

exports.update = async (req, res) =>{
    const {name} = req.body;
    try{
        const updated = await Category.findOneAndUpdate(
            { slug : req.params.slug },
            { name , slug : slugify(name) },
            { new : true } // to get new cat info to send as res
        );
        res.json(updated);
    }catch (err){
        res.status(400).send('Category update failed - controllers/category.js');
    }
}

exports.remove = async (req, res) =>{
    try {
        const deleted = await Category.findOneAndDelete({ slug : req.params.slug });
        res.json(deleted);
        console.log(deleted);
    }catch (err){
        res.status(400).send('Could not delete the category - controllers/category.js');
    }
}

exports.getSubs = (req, res) => {
        Sub.find({ parent : req.params._id }).exec((err, subs) => {
            if (err) 
                console.log(err);
            else
                res.json(subs);
        });
}