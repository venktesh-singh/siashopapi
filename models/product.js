const mongoose = require('mongoose');

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
    price: {
        type: Number,
        default: 0
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
    subsubcategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Subsubcategory',
        required: true
    },
    countInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 255
    },
    review : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',  
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
        default: false
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

productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

productSchema.set('toJSON', {
    virtuals: true
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
