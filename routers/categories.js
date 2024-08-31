const Category = require('../models/category');
const SubCategory = require('../models/sub-category');
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

router.post('/add', async (req, res) => {
    try {
        console.log('Incoming request:', req.body);

        let category = new Category({
            cat_name: req.body.cat_name,
            metaTitle: req.body.metaTitle,
            metaDescription: req.body.metaDescription
        });

        category = await category.save();
        if (!category) {
            return res.status(404).json({ message: "Category Not Found!" });
        }

        return res.status(201).json(category);
    } catch (error) {
        console.error('Error adding category:', error.message);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ message: "An error occurred while saving the category" });
    }
});


router.put(`/edit/:id`, async (req, res) => {
    try {
        
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                cat_name: req.body.cat_name,
                metaTitle: req.body.metaTitle,
                metaDescription: req.body.metaDescription 
            },
            { new: true }
        );

        if (!category) {
            return res.status(404).send("Category Not Found!");
        }

        res.status(200).send(category);
    } catch (error) {
        res.status(500).send("An error occurred while updating the category");
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