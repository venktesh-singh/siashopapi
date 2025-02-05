const express = require('express');
const router  = express.Router();
const Cart = require('../models/cart');
const  Order  = require('../models/order');
const  OrderItem  = require('../models/order-item'); 

router.post('/add', async (req, res) => {
    try {
        const { userId, items } = req.body;
        console.log("Check cart", req.body);
        
        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        for (let item of items) {
            const itemIndex = cart.items.findIndex(cartItem => cartItem.product.toString() === item.productId);
            if (itemIndex > -1) {
                cart.items[itemIndex].quantity += item.quantity;
            } else {
                cart.items.push({ product: item.productId, quantity: item.quantity });
            }
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/* 
For Single Item Post
{
    "userId": "60d21b4667d0d8992e610c85",
    "productId": "60d21b5667d0d8992e610c86",
    "quantity": 2
}

For Multiple Item Post
http://localhost:4000/api/v1/carts/add
{
    "userId": "668257dcc71596f00ee71757",
    "items": [
        {
            "productId": "665eb513c34e1f26930ef61b",
            "quantity": 2
        },
        {
            "productId": "66602b05e2b27b216bbf1f04",
            "quantity": 3
        }
    ]
}
*/

router.delete('/:itemId', async (req, res) => {
    try {
        const { userId } = req.body;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/update/:itemId', async (req, res) => {
    try {
        const { userId, quantity } = req.body;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity = quantity;
        } else {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        await cart.save();
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.post('/checkout', async (req, res) => {
    try {
        const { orderItems, shippingAddress1, shippingAddress2, city, zip, country, phone, totalPrice, user } = req.body;
        
        
        const cart = await Cart.findOne({ user }).populate('items.product');
        console.log('Checkout request received with body:', cart);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const orderItemsIds = await Promise.all(cart.items.map(async item => {
            let orderItem = new OrderItem({
                product: item.product._id,
                quantity: item.quantity
            });
            await orderItem.save();
            return orderItem._id;
        }));

        const orderID = `#${Math.floor(1000000 + Math.random() * 9000000)}`;

        let order = new Order({
            orderItems: orderItemsIds,
            user,
            shippingAddress1,
            shippingAddress2,
            city,
            zip,
            country,
            phone,
            totalPrice,
            status: 'Pending',
            orderID,
            tracking: {
                status: 'Not Shipped'
            }
        });

        await order.save();

        await Cart.deleteOne({ user });

        res.status(200).json(order);
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ error: error.message });
    }
});

/*
http://localhost:4000/api/v1/carts/checkout
{
    "orderItems": [
        "665eb513c34e1f26930ef61b",
        "66602b05e2b27b216bbf1f04"
    ],
    "shippingAddress1": "Gajiyabad Complex",
    "shippingAddress2": "Uttar Pradesh",
    "city": "Gajiyabad",
    "zip": "226201",
    "country": "India",
    "phone": "9876543212",
    "status": "Pending",
    "totalPrice": 22000,
    "user": "668257dcc71596f00ee71757",
    "tracking": {
        "status": "Not Shipped"
    },"
}
*/


module.exports = router