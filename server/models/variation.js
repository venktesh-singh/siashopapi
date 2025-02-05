const mongoose = require('mongoose');

// Variation Schema
const variationSchema = new mongoose.Schema({
    product_name_with_color: {
        type:String,
        required: true,
    },
    color_name: { 
        type: String, 
        required: true // e.g., "Red", "Green", "Yellow", "White", etc.
    },
    color_img: { 
        type: String, 
        default: '' 
    },
    single_img: { 
        type: String, 
        default: '' 
    },
    gallery_img: [{ 
        type: String 
    }],
    video: { 
        type: String, 
        default: '' 
    },
    sizes: [
        {
            size: { 
                type: String, 
                required: true 
            },
            sku: { 
                type: String, 
                required: true 
            },
            stock: { 
                type: Number, 
                default: 0, 
                min: 0 
            },
            price: { 
                type: Number, 
                required: true 
            },
            sale_price: { 
                type: Number, 
                default: 0 
            }
        }
    ]
});

// Virtual Field for ID
variationSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// Enable Virtuals in JSON
variationSchema.set('toJSON', {
    virtuals: true
});

// Model for Variation
const Variation = mongoose.model('Variation', variationSchema);

module.exports = Variation;
