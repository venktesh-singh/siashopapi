const express = require('express');
const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const router = express.Router();

// Get all subcategories
router.get('/', async (req, res) => {
    try {
        const subcategories = await SubCategory.find().populate('category');
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
router.post('/add', async (req, res) => {
    const { subcat_name, subcat_slug, category, metaTitle, metaDescription } = req.body;

    try {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).send("Category not found!");
        }

        const subCategory = new SubCategory({
            subcat_name,
            subcat_slug,
            category: categoryExists._id, // Ensure correct reference to category ID
            metaTitle,
            metaDescription,
        });

        await subCategory.save();

        res.status(201).json({ subCategory });
    } catch (error) {
        console.error("Error creating subcategories:", error);
        res.status(500).send("An error occurred while creating subcategories");
    }
});


// Update subcategory
router.put('/edit/:id', async (req, res) => {
    const { subcat_name, subcat_slug, category, metaTitle, metaDescription } = req.body;

    try {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(404).send("Category not found!");
        }

        const updatedSubCategory = await SubCategory.findByIdAndUpdate(
            req.params.id,
            {   subcat_name,
                subcat_slug,
                category: categoryExists._id, 
                metaTitle,
                metaDescription
            },
            { new: true, runValidators: true }
        );

        if (!updatedSubCategory) {
            return res.status(404).send("Subcategory not found!");
        }

        res.status(200).json(updatedSubCategory);
    } catch (error) {
        console.error("Error updating subcategory:", error);
        res.status(500).send("An error occurred while updating the subcategory");
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
