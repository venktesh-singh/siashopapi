const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    trackingNumber: {
        type: String,
        required: true
    },
    carrier: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Shipped', 'In Transit', 'Delivered', 'Failed'],
        default: 'Pending'
    },    
    estimatedDeliveryDate: {
        type: Date
    },
    deliveryDate: {
        type: Date
    },
    recipientName: {
        type: String,
        required: true
    },
    recipientPhone: {
        type: String,
        required: true
    },
    shippingAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

shipmentSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

shipmentSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Shipment',shipmentSchema);