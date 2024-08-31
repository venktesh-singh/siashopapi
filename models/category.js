const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    cat_name: {
        type: String,
        required: true
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
