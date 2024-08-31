
const express = require('express');
const router  = express.Router();
const Order = require('../models/order');
const  OrderItem  = require('../models/order-item');

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().sort({ 'dateOrdered': -1 })
            .populate('user')
            .populate({
                path: 'orderItems',
                populate: [
                    {
                        path: 'product',
                        populate: [
                            { path: 'subcategory' },
                            { path: 'category' }
                        ]
                    }
                ]
            });
        res.send(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get(`/:id`, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            }).sort({'dateOrdered':-1});

        if (!order) {
            return res.status(500).json({ success: false, message: "Order cannot be found" });
        }

        res.send(order);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


router.post(`/`, async (req, res) => {
    try {
        const orderItemIds = await Promise.all(req.body.orderItems.map(async orderItem => {
            let newOrderItem = new OrderItem({
                product: orderItem.product,
                quantity: orderItem.quantity
            });
            newOrderItem = await newOrderItem.save();
            return newOrderItem._id;
        }));
        const orderItemsIdsResolved = await orderItemIds;

        const totalPrice = await Promise.all(orderItemsIdsResolved.map(async orderItemId => {
            const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
            return orderItem.product.price * orderItem.quantity;
        })).then(prices => prices.reduce((acc, price) => acc + price, 0));

        const order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city,
            zip: req.body.zip,
            country: req.body.country,
            phone: req.body.phone,
            status: req.body.status,
            totalPrice: totalPrice,
            user: req.body.user,
        });

        const savedOrder = await order.save();

        if (!savedOrder) {
            return res.status(500).send("The order cannot be created!");
        }

        res.send(savedOrder);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.put(`/:id`, async (req, res) => {
    const order = await Order.findByIdAndUpdate(req.params.id, {
        status : req.body.status,
        },
        {new: true}
    )
    if(!order){
        return res.status(500).send("Order can't updated!");
    }
    res.status(200).send(order);
});


router.delete(`/:id`, async (req, res) => {
    try {
        const order = await Order.findByIdAndRemove(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        for (const orderItem of order.orderItems) {
            await OrderItem.findByIdAndRemove(orderItem);
        }

        return res.status(200).json({ success: true, message: "Order deleted successfully!" });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});


router.get('/get/totalsales', async (req, res) => {
    try {
        const totalSales = await Order.aggregate([
            { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
        ]);

        if (!totalSales || totalSales.length === 0) {
            return res.status(400).send("The order sales cannot be generated!");
        }

        res.send({ totalSales: totalSales[0].totalSales });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
});


router.get('/get/count', async (req, res) => {
    try {
        const orderCount = await Order.countDocuments();
        if (!orderCount) return res.status(500).json({ success: false });
        res.send({
            orderCount: orderCount
        });
    } catch (error) {
        console.error('Error fetching order count:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/get/userorders/:userid', async (req, res) => {
    try {
        const userOrders = await Order.find({ user: req.params.userid })
            .populate({
                path: 'orderItems',
                populate: {
                    path: 'product',
                    populate: 'category'
                }
            })
            .sort({ dateOrdered: -1 });

        if (!userOrders) {
            return res.status(404).json({ success: false, message: 'No orders found for this user' });
        }

        res.send(userOrders);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.put('/status/update/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        if (!['Pending', 'Shipped', 'Delivered'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const orderUpdate = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!orderUpdate) {
            return res.status(400).json({ message: "Order not found, status not updated!" });
        }

        res.status(200).json({ message: "Order Status Updated Successfully", Order: orderUpdate });
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});

module.exports = router

/*
{
    "orderItems" : [
        {
            "quantity" : 2,
            "product"  : "66602a67969d6c84dd66f4be"
        },
        {
            "quantity" : 3,
            "product"  : "66602a9d3e9077ca33d17bdd"
        }
    ],
    "shippingAddress1" : "Sector 48, Jankipuram",
    "shippingAddress2" : "Lucknow",
    "city" : "Lucknow",
    "zip"  : "223302",
    "country" : "India",
    "phone" : "9555400872",
    "totalPrice" : "1000",
    "user" : "6662a6dcf652add18e5d237f"
}

*/