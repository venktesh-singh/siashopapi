const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        default: () => `INV-${uuidv4().slice(0, 8).toUpperCase()}` 
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    billingAddress: {
        street: { type: String, required: true },
        apartment: { type: String },
        city: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true }
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            product_name: { type: String, required: true },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            total: { type: Number, required: true }
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash on Delivery'],
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date
    }
});

// Automatically populate customer and order details
invoiceSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'customer',
        select: 'username email phone street apartment city zip country'
    })
    .populate({
        path: 'order',
        populate: {
            path: 'orderItems',
            populate: { path: 'product', select: 'name price' }
        }
    });
    next();
});

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true, background: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
