const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const upload = require('../helper/uploadOptions');
const router = express.Router();

// Get all subcategories
router.get('/', async (req, res) => {
    try {
        const subcategories = await SubCategory.find().populate('category').sort({ dateCreated: -1 });
        res.status(200).send(subcategories);
    } catch (error) {
        res.status(500).send("An error occurred while fetching subcategories");
    }
});


// Get subcategory by ID
router.get('/:id', async (req, res) => {
    try {
        const subcategory = await SubCategory.findById(req.params.id).populate('category');
        if (!subcategory) {
            return res.status(404).send("SubCategory Not Found!");
        }
        res.status(200).send(subcategory);
    } catch (error) {
        res.status(500).send("An error occurred while fetching the subcategory");
    }
});

// Get subcategories by category ID
router.get('/category/:categoryId', async (req, res) => {
    try {
        const subcategories = await SubCategory.find({ category: req.params.categoryId }).populate('category');
        res.status(200).send(subcategories);
    } catch (error) {
        res.status(500).send("An error occurred while fetching subcategories");
    }
});

// Add new subcategory
router.post('/add', upload, async (req, res) => {
    try {
        const { subcat_name, subcat_slug, category, metaTitle, metaDescription } = req.body;

        if (!subcat_name || !category) {
            return res.status(400).json({ message: 'Subcategory name and category are required' });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found!' });
        }

        const subCategory = new SubCategory({
            subcat_name,
            subcat_slug,
            category: categoryExists._id, // Correctly reference the category ID
            metaTitle,
            metaDescription,
        });

        if (req.files && req.files['subcat_img'] && req.files['subcat_img'].length > 0) {
            const filename = req.files['subcat_img'][0].filename;
            subCategory.subcat_img = filename;
        }

        await subCategory.save();

        res.status(201).json({ message: 'Subcategory added successfully', subCategory });
    } catch (error) {
        console.error('Error creating subcategories:', error);
        res.status(500).json({ message: 'An error occurred while creating subcategories' });
    }
});


// Update subcategory
router.put('/edit/:id', upload, async (req, res) => {
    try {
        const { subcat_name, subcat_slug, category, metaTitle, metaDescription } = req.body;
        const { id } = req.params;

        if (!subcat_name || !category) {
            return res.status(400).json({ message: 'Subcategory name and category are required' });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: 'Category not found!' });
        }
        
        const updatedSubCategory = {
            subcat_name,
            subcat_slug,
            category: categoryExists._id, 
            metaTitle,
            metaDescription,
        };

        if (req.files && req.files['subcat_img'] && req.files['subcat_img'].length > 0) {
            const filename = req.files['subcat_img'][0].filename;
            updatedSubCategory.subcat_img = filename;
        }

        const subCategory = await SubCategory.findByIdAndUpdate(id, updatedSubCategory, { new: true });

        if (!subCategory) {
            return res.status(404).json({ message: "Subcategory not found!" });
        }

        res.status(200).json(subCategory);
    } catch (error) {
        console.error("Error updating subcategory:", {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: "An error occurred while updating the subcategory" });
    }
});



// Delete subcategory
router.delete('/:id', async (req, res) => {
    try {
        const subcategory = await SubCategory.findByIdAndDelete(req.params.id);
        if (!subcategory) {
            return res.status(404).json({ success: false, message: "SubCategory not found" });
        }
        res.status(200).json({ success: true, message: "SubCategory deleted successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: "An error occurred while deleting the subcategory" });
    }
});

module.exports = router;
