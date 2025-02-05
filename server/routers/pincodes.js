const express = require('express');
const router = express.Router();
const Pincode = require('../models/pincode');
const Product = require('../models/product'); // Ensure this path is correct

// Get all pincodes
router.get('/', async (req, res) => {
    try {
        const getPinCode = await Pincode.find().sort({ dateCreated: -1 });
        res.status(200).send(getPinCode);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get a specific pincode by ID
router.get('/:id', async (req, res) => {
    try {
        const PinCode = await Pincode.findById(req.params.id);
        if (!PinCode) {
            return res.status(404).json({ success: false, message: 'Pincode not found' });
        }
        res.status(200).send(PinCode);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Add a new pincode
router.post('/add', async (req, res) => {
    const { pincode, deliveryAvailable } = req.body;

    if (!pincode || deliveryAvailable === undefined) {
        return res.status(400).json({ message: 'Pincode and Delivery Available are required' });
    }

    try {
        const existingPincode = await Pincode.findOne({ pincode });

        if (existingPincode) {
            return res.status(409).json({ message: 'This Pincode is already available' });
        }

        const newPincode = new Pincode({ pincode, deliveryAvailable });
        await newPincode.save();

        res.status(201).json(newPincode);
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Check if delivery is available for a specific pincode
/*{
    "pincode": "122003",
    "deliveryAvailable": true
}*/
router.post('/check-delivery', async (req, res) => {
    const { pincode } = req.body;

    if (!pincode) {
        return res.status(400).json({ message: 'Pincode is required!' });
    }

    try {
        const existingPincode = await Pincode.findOne({ pincode });

        if (!existingPincode) {
            return res.status(404).json({ deliveryAvailable: false, message: "Pin code not found!" });
        }

        res.status(200).json({ deliveryAvailable: existingPincode.deliveryAvailable });
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error!" });
    }
});

// Check if a product can be delivered to a specific pincode
/*{
	"productId": "665eb513c34e1f26930ef61b",
	"pincode": "110039"
} */
    router.post('/check-product-delivery', async (req, res) => {
        const { productId, pincode } = req.body;
    
        if (!productId || !pincode) {
            return res.status(400).json({ message: 'Product ID and Pincode are required' });
        }
    
        try {
            const product = await Product.findById(productId).populate('availablePinCode');
    
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
    
            console.log("Product available pin codes: ", product.availablePinCode);
    
            const isDeliverable = product.availablePinCode.some(pin => pin.pincode === pincode && pin.deliveryAvailable);
            console.log("Check Deliverable:", isDeliverable);
    
            res.status(200).json({ deliveryAvailable: isDeliverable });
        } catch (error) {
            console.error('Error checking product delivery:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

// Edit an existing pincode
router.put('/edit/:id', async (req, res) => {
    try {
        const pincodeUpdate = await Pincode.findByIdAndUpdate(req.params.id,
            {
                pincode: req.body.pincode,
                deliveryAvailable: req.body.deliveryAvailable
            },
            { new: true }
        );
        if (pincodeUpdate) {
            return res.status(200).json({ success: true, message: "Pincode Updated Successfully" });
        }
        return res.status(404).json({ success: false, message: "Pincode not found" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete a pincode
router.delete('/:id', async (req, res) => {
    try {
        const pincode = await Pincode.findByIdAndDelete(req.params.id);
        if (pincode) {
            return res.status(200).json({ success: true, message: "Pin code deleted Successfully" });
        }
        return res.status(404).json({ success: false, message: "Pincode not found" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
