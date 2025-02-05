const express = require('express');
const router  = express.Router();
const Invoice = require('../models/invoice');
const Order   = require('../models/order');
const User    = require('../models/user');
const Product = require('../models/product');
 
router.post('/createInvoice', async (req, res) => {
    try {
        const { invoiceNumber, order, customer, subtotal, billingAddress, items, tax, totalAmount, paymentStatus, paymentMethod, issuedAt, dueDate } = req.body;
        
        const existingOrder = await Order.findById(order);
        if (!existingOrder) {
            return res.status(400).json({ success: false, message: "Invalid Order!" });
        }

        const existingCustomer = await User.findById(customer);
        if (!existingCustomer) {
            return res.status(400).json({ success: false, message: "Invalid Customer!" });
        }

        const validatedItems = [];
        for (const item of items) {
            const existProduct = await Product.findById(item.product);
            if (!existProduct) {
                return res.status(400).json({ success: false, message: `Invalid Product: ${item.product}` });
            }
            console.log("Check Invoice Create",existProduct.product_name)
            validatedItems.push({
                product: existProduct._id,
                product_name: existProduct.product_name,
                quantity: item.quantity,
                price: existProduct.price,
                total: item.quantity * existProduct.price
            });
        }
        
        const invoice = new Invoice({
            invoiceNumber, 
            order: existingOrder._id,
            customer: existingCustomer._id, 
            billingAddress: {
                street: billingAddress.street,
                apartment: billingAddress.apartment,
                city: billingAddress.city,
                zip: billingAddress.zip,
                country: billingAddress.country
            },
            items: validatedItems,
            subtotal,
            tax,
            totalAmount,
            paymentStatus,
            paymentMethod,
            issuedAt,
            dueDate
        });

        const savedInvoice = await invoice.save();
        res.status(201).json({ success: true, message: "Invoice created successfully", invoice: savedInvoice });

    } catch (error) {
        console.error("Error creating invoice:", error);
        res.status(500).json({ success: false, message: "An error occurred while creating the Invoice.", error: error.message });
    }
});

/*
{
    "order": "674b00080eaa19e984c359f8", 
    "customer": "67499ded030b1fee5910bafa", 
    "billingAddress": {
        "street": "Kotwa",
        "apartment": "Gohna Kalna",
        "city": "Amethi ",
        "zip": "226201",
        "country": "India"
    },
    "items": [
        {
            "product": "67486c115f575f376dcd450d",
            "product_name": "Dell 3100 3100",
            "quantity": 2,
            "price": 395,
            "total": 395
        }
    ],
    "subtotal": 395,
    "tax": 5.20,
    "totalAmount": 395,
    "paymentStatus": "Pending",
    "paymentMethod": "Credit Card",
    "issuedAt": "2024-08-31",
    "dueDate": "2024-09-07"
}
*/

router.get('/createInvoiceAll', async(req, res) =>{
    try{
        const invoice = await Invoice.find({}).sort({ dateCreated: -1 }).populate('order');
        res.status(200).json({ status: false, message:"Get All Invoice Successfully", invoice:invoice  })
    }catch (err){
        console.error("Error fetching shipments:", err);
        res.status(500).json({ success: false, message:"An error occurred while fetching shipments." })
    }
})

router.get('/createInvoiceAll/:id', async(req, res) =>{
    
})

module.exports = router