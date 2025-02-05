const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
const upload = require('../helper/uploadOptions');
const express = require('express');
const router  = express.Router();

router.get(`/`, async (req, res) => {
    console.log("Sub Categories",req.body)
    try {
        let filter = {};
        if (req.query.subcategories) {
            filter = { subCategory: req.query.subcategories.split(',') };
        }
        const categories = await Category.find(filter).sort({ dateCreated: 1 });
        res.send(categories);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        });
    }
});

router.get(`/:id`, async (req, res) => {
    const category = await Category.findById(req.params.id);
    if(!category){
        return res.status(500).send("Category Not Found!");
    }
    res.status(200).send(category);
})

router.post('/add', upload, async (req, res) => {
    try {
        let category = new Category({
            cat_name: req.body.cat_name,
            cat_slug: req.body.cat_slug,
            metaTitle: req.body.metaTitle,
            metaDescription: req.body.metaDescription,
        });

        if (req.files && req.files['cat_img'] && req.files['cat_img'].length > 0) {
            const fileName = req.files['cat_img'][0].filename;
            category.cat_img = fileName; 
        } else {
            return res.status(400).json({ message: 'Category Image is required' });
        }

        category = await category.save();

        if (!category) {
            return res.status(500).json({ message: 'Failed to save the category' });
        }

        return res.status(201).json({ message: 'Category added successfully', category });
    } catch (error) {
        console.error('Error adding category:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ message: 'An error occurred while saving the category' });
    }
});


router.put('/edit/:id', upload, async (req, res) => {
    try {
        const { id } = req.params;
        const { cat_name, cat_slug, metaTitle, metaDescription } = req.body;

        const category = {
            cat_name,
            cat_slug,
            metaTitle,
            metaDescription,
        };

        if (req.files && req.files['cat_img']) {
            const fileName = req.files['cat_img'][0].filename;
            category.cat_img = fileName;
        }

        const updatedCategory = await Category.findByIdAndUpdate(id, category, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found!' });
        }

        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error.message);
        res.status(500).json({ message: 'An error occurred while updating the category' });
    }
});


router.delete(`/:id`, (req, res) => {
    Category.findByIdAndDelete(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({success: true, message:"Category deleted successfully!"})
        }else{
            return res.status(400).json({success:false , message:"Category not found"})
        }
    }).catch(err =>{
        return res.status(400).json({success:false, error:err})
    })
})

module.exports = router