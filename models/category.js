const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    cat_name: {
        type: String,
        required: true
    },
    cat_img: {
        type: String,
        required: true
    },
    cat_slug: {
        type: String,
        default: ''
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    dateCreated: {
        type: Date,
        default: Date.now
    }  
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
