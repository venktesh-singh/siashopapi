const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: String,
        required: true
    }
});

orderItemSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

orderItemSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('OrderItem', orderItemSchema);  