const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Shipment = require('../models/shipment');

// Get all shipments
router.get('/getShipmentbyOrder', async (req, res) => {
    try {
        const shipments = await Shipment.find({}).sort({ dateCreated: -1 }).populate('order');
        res.status(200).json(shipments);
    } catch (error) {
        console.error("Error fetching shipments:", error);
        res.status(500).json({ success: false, message: "An error occurred while fetching shipments." });
    }
});

// Get shipment by ID
router.get('/getShipmentbyOrder/:id', async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id).populate('order');
        if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found!" });
        res.status(200).json(shipment);
    } catch (error) {
        console.error("Error fetching shipment:", error);
        res.status(500).json({ success: false, message: "An error occurred while fetching shipment." });
    }
});

// Create a shipment
router.post('/createShipment', async (req, res) => {
    try {
        const { trackingNumber, carrier, status, deliveryDate, recipientName, recipientPhone, shippingAddress, city, zip, country, shippingCost, notes, order } = req.body;

        const estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(400).json({ success: false, message: "Invalid Order!" });
        }

        const shipment = new Shipment({
            order: existingOrder._id,
            trackingNumber,
            carrier,
            status,
            estimatedDeliveryDate,
            deliveryDate,
            recipientName,
            recipientPhone,
            shippingAddress,
            city,
            zip,
            country,
            shippingCost,
            notes
        });

        const savedShipment = await shipment.save();
        res.status(201).json({ success: true, message: "Shipment created successfully!", shipment: savedShipment });

    } catch (error) {
        console.error("Error creating shipment:", error);
        res.status(500).json({ success: false, message: "An error occurred while creating the shipment.", error: error.message });
    }
});

// Update shipment status
router.put('/updateShipmentStatus/:id', async (req, res) => {
    try {
        const { trackingNumber, carrier, status, deliveryDate, recipientName, recipientPhone, shippingAddress, city, zip, country, shippingCost, notes, order } = req.body;
        const { id } = req.params;

        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(400).json({ success: false, message: "Invalid Order!" });
        }

        const updatedShipment = await Shipment.findByIdAndUpdate(
            id,
            {
                order: existingOrder._id,
                trackingNumber,
                carrier,
                status,
                deliveryDate,
                recipientName,
                recipientPhone,
                shippingAddress,
                city,
                zip,
                country,
                shippingCost,
                notes
            },
            { new: true }
        );

        if (!updatedShipment) {
            return res.status(404).json({ success: false, message: "Shipment not found!" });
        }

        res.status(200).json({ success: true, message: "Shipment updated successfully!", shipment: updatedShipment });

    } catch (error) {
        console.error("Error updating shipment:", error);
        res.status(500).json({ success: false, message: "An error occurred while updating the shipment.", error: error.message });
    }
});

router.put('/shipmentStatusUpdate/:shipmentId', async(req,res) =>{
    try{
        const {shipmentId} = req.params;
        const { status }   = req.body;
        
        if (!['Pending', 'Shipped', 'In Transit', 'Delivered', 'Failed'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        };

        const shipment = await Shipment.findByIdAndUpdate(shipmentId,
            { status  },
            {new : true} 
        )  
        
        if(!shipment){
            return res.status(400).json({ message: "Shipment not found, status not updated!" });
        }

        res.status(200).json({ success: false, message:"Shipment Status Update successfully"})
    }catch (error) {
        res.status(500).json({ success: false,message:"An error occurred while updating the shipment.", error:error.message });
    }
})

module.exports = router;
