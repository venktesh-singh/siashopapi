const express = require('express');
const mongoose = require('mongoose');
const Category = require('../models/category');
const Subcategory = require('../models/sub-category');
const Subsubcategory = require('../models/sub-subcategory');
const upload = require('../helper/uploadOptions');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const subsubcat = await Subsubcategory.find().populate('category').populate('subcategory');
        console.log("check subsubcategory", subsubcat)
        if (subsubcat.length > 0) {
            return res.status(200).json({ success: true, message: "Get All Subsubcategories", subsubcat });
        } else {
            return res.status(404).json({ success: false, message: "Subsubcategories Not Found" });
        }
    } catch (error) {
        console.error('Error:', error);  
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


// Get subcategory by ID
router.get('/:id', async (req, res) => {
    try {
        const subsubcat = await Subsubcategory.findById(req.params.id).populate('category').populate('subcategory');
        if (subsubcat) {
            return res.status(200).json({ success: true, message: "Get Subsubcategory By ID", subsubcat });
        } else {
            return res.status(404).json({ success: false, message: "Subsubcategory Not Found" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Get subcategory Behalf category
router.get('/category/:categoryId', async (req, res) => {
    try {
        const { categoryId } = req.params;
        console.log('Category ID received:', categoryId); // Log received category ID

        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            console.log('Invalid Category ID format:', categoryId);
            return res.status(400).json({ success: false, message: 'Invalid Category ID format' });
        }

        const subcategories = await Subcategory.find({ category: categoryId });
        console.log('Subcategories found:', subcategories); // Log found subcategories
        
        if (!subcategories || subcategories.length === 0) {
            console.log('No subcategories found for Category ID:', categoryId);
            return res.status(404).json({ success: false, message: 'Subcategory Not found' });
        }

        return res.status(200).json({ success: true, subcategories });
    } catch (error) {
        console.error('Error fetching subcategories:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Get subsubcategory Behalf subcategory
router.get('/subcategory/:subcategoryID', async (req, res) => {
    const {  subcategoryID } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subcategoryID)) {
        return res.status(400).json({ success: false, message: 'Invalid subcategory ID Format' });
    }

    try {
        const subsubcategories = await Subsubcategory.find({ subcategory: subcategoryID }).populate('category').populate('subcategory');

        if (subsubcategories.length > 0) {
            return res.status(200).json({ success: true, message: "Get Subsubcategories By Category and Subcategory", subsubcategories });
        } else {
            return res.status(404).json({ success: false, message: "Subsubcategories Not Found" });
        }
    } catch (error) {
        console.error('Error fetching subsubcategories:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


router.post('/add', upload, async (req, res) => {
    try {
        const { category, subcategory, subsubcat_name, subsubcat_url, meta_title, meta_desc } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(category)) {
            console.log('Invalid Category ID:', category);
            return res.status(400).json({ success: false, message: 'Invalid Category ID' });
        }

        const cat = await Category.findById(category); 
        if (!cat) { 
            console.log('Category Not Found:', category);
            return res.status(404).json({ success: false, message: 'Category Not Found' });
        }

        if (!mongoose.Types.ObjectId.isValid(subcategory)) {
            console.log('Invalid Subcategory ID:', subcategory);
            return res.status(400).json({ success: false, message: 'Invalid Subcategory ID' });
        }

        const subcat = await Subcategory.findById(subcategory); 
        if (!subcat) {
            console.log('Subcategory Not Found:', subcategory);
            return res.status(404).json({ success: false, message: 'Subcategory Not Found' });
        }

        const subsubcat = new Subsubcategory({
            category: cat._id,
            subcategory: subcat._id,
            subsubcat_name,
            subsubcat_url,
            meta_title,
            meta_desc
        });

        if(req.files && req.files['subsubcat_img']){
            let filename = req.files['subsubcat_img'][0].filename;
            subsubcat.subsubcat_img = filename;
        }

        await subsubcat.save();
        return res.status(200).json({ success: true, message: "Subsubcategory Added Successfully", subsubcat });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


// Update subcategory
router.put('/edit/:id', upload, async (req, res) => {
    try {
        const { category, subcategory, subsubcat_name, subsubcat_url, meta_title, meta_desc } = req.body;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ success: false, message: 'Invalid Category ID' });
        }
        const cat = await Category.findById(category);
        if (!cat) {
            return res.status(404).json({ success: false, message: 'Category Not Found' });
        }

        if (!mongoose.Types.ObjectId.isValid(subcategory)) {
            return res.status(400).json({ success: false, message: 'Invalid Subcategory ID' });
        }
        const subcat = await Subcategory.findById(subcategory);
        if (!subcat) {
            return res.status(404).json({ success: false, message: 'Subcategory Not Found' });
        }

        // Update subsubcategory
        const subsubcat = {
                subsubcat_name,
                meta_title,
                meta_desc,
                subsubcat_url,
                category: cat._id,
                subcategory: subcat._id
            };

        if(req.files && req.files['subsubcat_img']){
            let filename = req.files['subsubcat_img'][0].filename;
            subsubcat.subsubcat_img = filename;
        }

        const updateSubsubcat = await Subsubcategory.findByIdAndUpdate(id, subsubcat, {new:true});

        if (updateSubsubcat) {
            return res.status(200).json({ success: true, message: 'Subsubcategory Updated Successfully', updateSubsubcat });
        } else {
            return res.status(404).json({ success: false, message: 'Subsubcategory Not Updated' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});


// Delete subsubcategory
router.delete('/:id', async (req, res) => {
    try {
        const subsubcat = await Subsubcategory.findByIdAndDelete(req.params.id);
        if (subsubcat) {
            return res.status(200).json({ success: true, message: "Subsubcategory Deleted Successfully", subsubcat });
        } else {
            return res.status(404).json({ success: false, message: "Subsubcategory Not Found" });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;