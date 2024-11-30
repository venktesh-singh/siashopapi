const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    variations: [
        {
            color: String,
            size: String,
            price: Number,
            stock: {
                type: Number,
                default: 0
            }  
        }
    ]
});

const Attribute = mongoose.model('Attribute', attributeSchema);

module.exports = Attribute;
