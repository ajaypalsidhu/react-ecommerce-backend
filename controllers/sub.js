const Sub = require('../models/sub');
const Product = require('../models/product');
const slugify = require('slugify');

exports.create = async (req, res) => {
    try{
        const {name, parent } = req.body;
        const sub = await new Sub({ name, parent, slug:  slugify(name) }).save();
        //console.log(category);
        res.json(sub);
    }catch (err) {
        console.log(err);
        res.status(400).send('Create sub failed');
    }
}
 
exports.list = async (req, res) => {
    res.json(await Sub.find({}).sort({createdAt : -1}).exec());
}

exports.read = async (req, res) => {
    try{
        let sub = await Sub.findOne({ slug : req.params.slug }).exec();
        const products = await Product.find({ subs : sub })
        .populate('category')
        .exec();

        res.json({ 
            sub,
            products
        }); // in the front end we can access these by res.data.category and res.data.products
    }catch(err){
        console.log(err);
    }
}

exports.update = async (req, res) => {
    const {name, parent} = req.body;
    try{
        const updated = await Sub.findOneAndUpdate(
            { slug : req.params.slug },
            { name, parent , slug : slugify(name) },
            { new : true } // to get new cat info to send as res
        );
        res.json(updated);
    }catch (err){
        res.status(400).send('Category sub failed - controllers/category.js');
    }
}

exports.remove = async (req, res) => {
    try {
        const deleted = await Sub.findOneAndDelete({ slug : req.params.slug });
        res.json(deleted);
        console.log(deleted);
    }catch (err){
        res.status(400).send('Could not delete the sub - controllers/category.js');
    }
}