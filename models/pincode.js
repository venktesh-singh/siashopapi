const mongoose = require('mongoose');

const pincodeSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
        match: /^[0-9]{6}$/, // Regular expression to ensure exactly 6 digits
        minlength: 6,
        maxlength: 6,
    },
    deliveryAvailable: {
        type: Boolean,
        required: true,
        default: false
    },  
    dateCreated: {
        type: Date,
        default: Date.now
    }
});

pincodeSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

pincodeSchema.set('toJSON', {
    virtuals: true  
});

const Pincode = mongoose.model('Pincode', pincodeSchema);

module.exports = Pincode;
