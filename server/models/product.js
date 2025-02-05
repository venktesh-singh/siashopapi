const mongoose = require('mongoose');

// Product Schema
const productSchema = new mongoose.Schema({
    product_name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    richDescription: {
        type: String,
        default: ''
    },
    product_img: {
        type: String,
        default: ''
    },
    product_gallery: [{
        type: String 
    }],
    brand: {
        type: String,
        default: ''
    },
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
    subsubcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subsubcategory',
        required: true
    },
    isSingleProduct: {
        type: Boolean,
        default: true 
    },
    
    price: {
        type: Number,
        default: 0
    },
    countInStock: {
        type: Number,
        min: 0,
        default: 0
    },
    
    variation: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variation' 
        }
    ],
    review: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    },
    metaTitle: {
        type: String,
        default: ''
    },
    metaDescription: {
        type: String,
        default: ''
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    product_slug: {
        type: String,
        default: ''
    },
    availablePinCode: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pincode'
    }],
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

// Virtual Field for ID
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Enable Virtuals in JSON
productSchema.set('toJSON', {
    virtuals: true
});

// Model for Product
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
