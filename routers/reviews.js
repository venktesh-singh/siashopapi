const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/review');
const User = require('../models/user');
const Product = require('../models/product');

router.get('/', async (req, res) => {
    try {
        const reviews = await Review.find().sort({ dateReviewed: -1 }).populate('user').populate('product');
        res.status(200).send(reviews);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).send("Review Not Found!");
        }
        res.status(200).send(review);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/add', async (req, res) => {
    const { user, product, rating, reviewText } = req.body;

    try {
        if (!mongoose.Types.ObjectId.isValid(user)) {
            return res.status(404).send("User Id cannot be found!");
        }

        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).send("User Not Found!");
        }

        if (!mongoose.Types.ObjectId.isValid(product)) {
            return res.status(404).send("Product Id cannot be found!");
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).send("Product Not Found!");
        }

        const newReview = new Review({
            user: userExists._id,
            product: productExists._id,
            rating,
            reviewText,
        });

        await newReview.save();
        res.status(200).json(newReview);
    } catch (error) {
        console.log("Error creating Review:", error);
        res.status(500).send("An error occurred while creating the review");
    }
});

router.put('/edit/:id', async (req, res) => {
    const { user, product, rating, reviewText } = req.body;

    try {
        const userExists = await User.findById(user);
        if (!userExists) {
            return res.status(404).send("User not found!");
        }

        const productExists = await Product.findById(product);
        if (!productExists) {
            return res.status(404).send("Product not found!");
        }

        const reviewUpdate = await Review.findByIdAndUpdate(
            req.params.id,
            {
                user: userExists._id,
                product: productExists._id,
                rating,
                reviewText
            },
            { new: true }
        );

        if (!reviewUpdate) {
            return res.status(404).send("Review not updated!");
        }

        res.status(200).json(reviewUpdate);
    } catch (error) {
        console.error("Error updating review:", error);
        res.status(500).send("Review cannot be updated!");
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found!" });
        }
        res.status(200).json({ success: true, message: "Review deleted successfully!" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Review cannot be deleted!" });
    }
});

router.get('/get/count', async (req, res) => {
    try{
        const reviewCount = await Review.countDocuments();
        if(reviewCount === 0) {
            return res.status(404).json({success:false, message: "Review not count"})
        }
        res.status(200).json({ success: true, reviewCount: reviewCount})
    } catch {
        res.status(400).json({success:false, message: "Review cannot be counted!", error: error.message})
    }
    
})

module.exports = router;
