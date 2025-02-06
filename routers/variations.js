const express     = require('express');
const router      = express.Router();
const fs          = require('fs');
const multer      = require('multer');
const Variation   = require('../models/variation');
const upload      = require('../helper/uploadOptions');


router.get('/', async(req, res) => {
    try {
        const variations = await Variation.find().sort({ dateCreated: -1 });
        res.status(200).send(variations);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
})


router.get(`/:id`, async(req, res) =>{
    const variation = await Variation.findById(req.params.id);
    if(!variation){
        return res.status(500).send("Variation Not Found!");
    }
    res.status(200).send(variation);
})


router.post(`/add`, upload, async (req, res) => {
    try {
        const { product_name_with_color, color_name, sizes } = req.body;

        console.log("Request Body:", req.body);

        const variation = new Variation({
            product_name_with_color,
            color_name
        });

        if (req.files['color_img'] && req.files['color_img'].length > 0) {
            variation.color_img = req.files['color_img'][0].filename;
        }

        if (req.files['single_img'] && req.files['single_img'].length > 0) {
            variation.single_img = req.files['single_img'][0].filename;
        }

        if (req.files['video'] && req.files['video'].length > 0) {
            variation.video = req.files['video'][0].filename;
        }

        if (req.files['gallery_img'] && req.files['gallery_img'].length > 0) {
            const galleryImages = req.files['gallery_img'].map(file => file.filename);
            variation.gallery_img = galleryImages;
        }

        //console.log("Check Sizes", Object.keys(sizes["'size'"]));

        if (sizes) {
            let parsedSizes;
            try {
                parsedSizes = JSON.parse(sizes); // Parse the JSON string into an array
            } catch (error) {
                throw new Error('Invalid sizes data: sizes must be a valid JSON string');
            }

            if (!Array.isArray(parsedSizes)) {
                throw new Error('sizes must be an array');
            }

            const sizesArray = parsedSizes.map((size) => ({
                size: size.size,
                sku: size.sku,
                stock: parseInt(size.stock, 10) || 0,
                price: parseFloat(size.price) || 0,
                sale_price: parseFloat(size.sale_price) || 0,
            }));

            variation.sizes = sizesArray;
        } else {
            variation.sizes = [];
        }


        const savedVariation = await variation.save();

        res.status(201).json({ 
            success: true, 
            message: "Variation created successfully!", 
            variation: savedVariation 
        });
    } catch (error) {
        console.error("Error creating variation:", error);
        res.status(500).json({ 
            success: false, 
            message: "An error occurred while creating the variation.", 
            error: error.message 
        });
    }
});



router.put(`/edit/:id`,upload, async(req, res) => {
    try{
        const { id } = req.params;
        const { product_name_with_color, color_name, sizes } = req.body;
        //console.log("Check Variation",req.body);
        const variation = {
            product_name_with_color,
            color_name,
        }

        if (req.files['color_img'] && req.files['color_img'].length > 0) {
            variation.color_img = req.files['color_img'][0].filename;
        }

        if (req.files['single_img'] && req.files['single_img'].length > 0) {
            variation.single_img = req.files['single_img'][0].filename;
        }

        if (req.files['video'] && req.files['video'].length > 0) {
            variation.video = req.files['video'][0].filename;
        }

        if (req.files['gallery_img'] && req.files['gallery_img'].length > 0) {
            const galleryImages = req.files['gallery_img'].map(file => file.filename);
            variation.gallery_img = galleryImages;
        }

        if (sizes) {
            let parsedSizes;
            try {
                parsedSizes = JSON.parse(sizes); // Parse the JSON string into an array
            } catch (error) {
                throw new Error('Invalid sizes data: sizes must be a valid JSON string');
            }

            if (!Array.isArray(parsedSizes)) {
                throw new Error('sizes must be an array');
            }

            const sizesArray = parsedSizes.map((size) => ({
                size: size.size,
                sku: size.sku,
                stock: parseInt(size.stock, 10) || 0,
                price: parseFloat(size.price) || 0,
                sale_price: parseFloat(size.sale_price) || 0,
            }));

            variation.sizes = sizesArray;
        } else {
            variation.sizes = [];
        }

        const updateVariation = await Variation.findByIdAndUpdate(id, variation , {new:true})

        res.status(201).json({
            success: true,
            message:"Variation updated successfully!",
            variation: updateVariation
        })
    } catch (error) {
        console.log("Error creating variation:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while creating the variation",
            error: error.message
        });
    }
})


router.delete(`/delete/:id`, async(req, res) => {
    try{
        const variation = await Variation.findByIdAndDelete(req.params.id);
        if (!variation) {
            return res.status(404).json({
                success: false,
                message: "Variation not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Variation deleted successfully!"
        });
    } catch(err){
        res.status(500).json({ success: false, error: err.message });
    }
})


module.exports = router;
