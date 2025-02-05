const mongoose = require('mongoose');


const subsubcategorySchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category', 
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory', 
        required: true
    },
    subsubcat_name: {
        type: String,
        required: true
    },
    subsubcat_img: {
        type: String,
        required: true
    },
    subsubcat_url: {
        type: String,
        default: '' 
    },
    meta_title: {
        type: String 
    },
    meta_desc: {
        type: String 
    },
    dateCreated: {
        type: Date,
        default: Date.now 
    }
});


subsubcategorySchema.virtual('id').get(function() {
    return this._id.toHexString();
});


subsubcategorySchema.set('toJSON', {
    virtuals: true
});


const Subsubcategory = mongoose.model('Subsubcategory', subsubcategorySchema);

module.exports = Subsubcategory;
