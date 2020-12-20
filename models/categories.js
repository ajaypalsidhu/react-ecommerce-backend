const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    // id will be generated automatically
    name : {
        type : String,
        trim : true, // to remove whitespaces from beginning or end
        required : 'Category name is required - models/categories.js',
        minlength : [2, 'Too short'],
        maxlength : [32, 'Too long']
    },
    slug : {
        type : String,
        trim : true,
        unique : true,
        lowercase : true,
        index : true, // this field will be used to query the DB
    }
}, { timestamps : true }
);

module.exports = mongoose.model('Category', categorySchema);