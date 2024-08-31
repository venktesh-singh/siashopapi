const mongoose = require('mongoose');

const subcategorySchema = new mongoose.Schema({
    subcat_name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
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

const SubCategory = mongoose.model('SubCategory', subcategorySchema);

module.exports = SubCategory;
