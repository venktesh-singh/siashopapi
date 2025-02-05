const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Category= require('../models/category');
const SubCategory = require('../models/sub-category');
const Subsubcategory = require('../models/sub-subcategory');
const Variation = require('../models/variation');
const mongoose = require('mongoose');
const upload = require('../helper/uploadOptions');
const Pincode = require('../models/pincode');
const csvParser = require('csv-parser');
const fs = require('fs');
const multer = require('multer');


router.get(`/`, async (req, res) => {
    console.log("Query check", req.query);
    try {
        let filter = {};
        if (req.query.categories) {
            const CatA = { category: req.query.categories.split(',').map(id => id.trim()) };
            filter.category = { $in:CatA }
        }
        if (req.query.subcategories) {
            const SubCatA = req.query.subcategories.split(',').map(id => id.trim);
            filter.subcategory = { $in: SubCatA}
        }
        const products = await Product.find(filter).sort({ dateCreated: -1 }).populate('category').populate('subcategory').populate('subsubcategory').populate('variation');
        res.send(products);
    } catch (err) {
        res.status(500).json({
            error: err,
            success: false
        });
    }
});


router.get(`/:id`, async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category').populate('subcategory').populate('subsubcategory').populate('review').populate('variation');
    if(!product) return res.status(500).json({success:false});
    res.send(product);
})

router.post('/add', upload, async (req, res) => {
    try {
        const category = await Category.findById(req.body.category);
        if (!category) {
            return res.status(400).send({ success: false, message: "Invalid Category!" });
        }

        const subcategory = await SubCategory.findById(req.body.subcategory);
        if (!subcategory) {
            return res.status(400).send({ success: false, message: "Invalid Subcategory!" });
        }

        const subsubcategory = await Subsubcategory.findById(req.body.subsubcategory);
        if(!subsubcategory){
            return res.status(400).send({ success: false, message: "Invalid Subsubcategory!" })
        }

        let variationIds = [];
        if (req.body.variation) {
            if (typeof req.body.variation === 'string') {
                variationIds = req.body.variation.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
            } else if (Array.isArray(req.body.variation)) {
                variationIds = req.body.variation.map(id => new mongoose.Types.ObjectId(id));
            }
        }

        const variationData = await Variation.find({ _id: { $in: variationIds } });
        if (variationData.length !== variationIds.length) {
            return res.status(400).send({ success: false, message: "Some variations are invalid!" });
        }

        let newProductData = {
            product_name: req.body.product_name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            subcategory: req.body.subcategory,
            subsubcategory: req.body.subsubcategory,
            variation: variationIds,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            metaTitle: req.body.metaTitle,
            metaDescription: req.body.metaDescription,
            product_slug:req.body.product_slug,
            isFeatured: req.body.isFeatured
        };

        if (req.files['product_img']) {
            const fileName = req.files['product_img'][0].filename;
            newProductData.product_img = `${fileName}`;  
        }

        if (req.files['product_gallery']) {
            const galleryImages = req.files['product_gallery'].map(file => {
                return `${file.filename}`;
            });    
            newProductData.product_gallery = galleryImages;  
        }

        const newProduct = new Product(newProductData);
        const savedProduct = await newProduct.save();

        res.status(201).send(savedProduct);
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).send({ success: false, message: "Failed to add product!" });
    }
});


router.put('/edit/:id', upload, async (req, res) => {
    try {
        const productId = req.params.id;

        console.log("Received request to update product:", productId, req.body);  

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Invalid Product ID!" });
        }

        const category = await Category.findById(req.body.category);
        if (!category) {
            console.error(`Category with ID ${req.body.category} not found`);
            return res.status(400).json({ success: false, message: "Invalid Category!" });
        }

        const subcategory = await SubCategory.findById(req.body.subcategory);
        if (!subcategory) {
            console.error(`Subcategory with ID ${req.body.subcategory} not found`);
            return res.status(400).json({ success: false, message: "Invalid Subcategory!" });
        }

        const subsubcategory = await Subsubcategory.findById(req.body.subsubcategory);
        if (!subsubcategory) {
            return res.status(400).json({ success: false, message: "Invalid Subsubcategory!" });
        }

        let variationIds = [];
        if (req.body.variation) {
            if (typeof req.body.variation === 'string') {
                variationIds = req.body.variation.split(',').map(id => id.trim());
            } else if (Array.isArray(req.body.variation)) {
                variationIds = req.body.variation.map(id => id.trim());
            }
        }

        variationIds = variationIds.map(id => new mongoose.Types.ObjectId(id));

        const variationData = await Variation.find({ _id: { $in: variationIds } });
        if (variationData.length !== variationIds.length) {
            return res.status(400).json({ success: false, message: "Some variations are invalid!" });
        }

        let productUpdateData = {
            product_name: req.body.product_name || "",
            description: req.body.description || "",
            richDescription: req.body.richDescription || "",
            brand: req.body.brand || "",
            price: req.body.price || 0,
            category: req.body.category,
            subcategory: req.body.subcategory,
            subsubcategory: req.body.subsubcategory,
            variation: variationIds, 
            countInStock: req.body.countInStock || 0,
            rating: req.body.rating || 0,
            numReviews: req.body.numReviews || 0,
            metaTitle: req.body.metaTitle || "",
            metaDescription: req.body.metaDescription || "",
            product_slug: req.body.product_slug || "",
            isFeatured: req.body.isFeatured || false,
        };

        if (req.files && req.files["product_img"] && req.files["product_img"].length > 0) {
            productUpdateData.product_img = req.files["product_img"][0].filename;
        }

        if (req.files && req.files["product_gallery"] && req.files["product_gallery"].length > 0) {
            productUpdateData.product_gallery = req.files["product_gallery"].map(file => file.filename);
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, productUpdateData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Product not found!" });
        }

        console.log("Product updated successfully:", updatedProduct);
        return res.status(200).json({ success: true, message: "Product updated successfully!", product: updatedProduct });

    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({ success: false, message: "Failed to update product!", error: error.message });
    }
});
  

router.delete(`/:id`, (req, res) => {
    Product.findByIdAndDelete(req.params.id).then(product =>{
        if(product){
            return res.status(200).json({success: true, message:"Product deleted successfully!"})
        }else{
            return res.status(400).json({success:false , message:"Product not found"})
        }
    }).catch(err =>{
        return res.status(400).json({success:false, error:err})
    })
})


router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments();
    if(!productCount) return res.status(500).json({success:false});
    res.send({
        productCount:productCount
    });
})


router.get(`/get/featured`, async (req, res) => {
    const products = await Product.find({isFeatured:true});
    if(!products) return res.status(500).json({success:false});
    res.send(products);
})


// http://localhost:4000/api/v1/products/get/catbaseproduct?category=Rice&subcategory=Non-Veg%20Rice&product=Chilli%20Basil%20Paneer
/************** Searching Product And Category Or Subcategory Based Product *************/
router.get('/get/catbaseproduct', async (req, res) => {
    console.log("Product Request Query:", req.query);

    try {
        const { category, subcategory, product } = req.query;

        let categoryData, subcategoryData, productNameData;

        // Handle the case when searching by product name only
        if (product && !category && !subcategory) {
            productNameData = await Product.findOne({ product_name: product });
            if (!productNameData) {
                console.error("Invalid product name");
                return res.status(404).json({ success: false, message: "Product not found!" });
            }
            console.log("Product Data:", productNameData);
            return res.status(200).json({ success: true, data: productNameData });
        }

        // Handle the case when searching by category and subcategory together
        if (category && subcategory) {
            categoryData = await Category.findOne({ cat_name: category });
            subcategoryData = await SubCategory.findOne({ subcat_name: subcategory });
            if (!categoryData || !subcategoryData) {
                console.error("Invalid category or subcategory name");
                return res.status(404).json({ success: false, message: "Category or subcategory not found!" });
            }

            const products = await Product.aggregate([
                {
                    $match: {
                        category: categoryData._id,
                        subcategory: subcategoryData._id
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                {
                    $unwind: '$subcategory'
                }
            ]);

            console.log("Category and Subcategory based Products:", products);

            if (products.length === 0) {
                console.warn("No products found for the given category and subcategory");
                return res.status(404).json({ success: false, message: "No products found for the given category and subcategory." });
            }

            return res.status(200).json({ success: true, data: products });
        }

        // Handle the case when searching by category only
        if (category && !subcategory) {
            categoryData = await Category.findOne({ cat_name: category });
            if (!categoryData) {
                console.error("Invalid category name");
                return res.status(404).json({ success: false, message: "Category not found!" });
            }

            const products = await Product.aggregate([
                {
                    $match: {
                        category: categoryData._id
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                {
                    $unwind: '$subcategory'
                }
            ]);

            console.log("Category based Products:", products);

            if (products.length === 0) {
                console.warn("No products found for the given category");
                return res.status(404).json({ success: false, message: "No products found for the given category." });
            }

            return res.status(200).json({ success: true, data: products });
        }

        // Handle the case when searching by subcategory only
        if (!category && subcategory) {
            subcategoryData = await SubCategory.findOne({ subcat_name: subcategory });
            if (!subcategoryData) {
                console.error("Invalid subcategory name");
                return res.status(404).json({ success: false, message: "Subcategory not found!" });
            }

            const products = await Product.aggregate([
                {
                    $match: {
                        subcategory: subcategoryData._id
                    }
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category',
                        foreignField: '_id',
                        as: 'category'
                    }
                },
                {
                    $unwind: '$category'
                },
                {
                    $lookup: {
                        from: 'subcategories',
                        localField: 'subcategory',
                        foreignField: '_id',
                        as: 'subcategory'
                    }
                },
                {
                    $unwind: '$subcategory'
                }
            ]);

            console.log("Subcategory based Products:", products);

            if (products.length === 0) {
                console.warn("No products found for the given subcategory");
                return res.status(404).json({ success: false, message: "No products found for the given subcategory." });
            }

            return res.status(200).json({ success: true, data: products });
        }

        // If none of the conditions match, return a bad request
        console.error("Missing category and subcategory");
        return res.status(400).json({ success: false, message: "Category and/or subcategory are required!" });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ success: false, message: "Failed to get products!" });
    }
});

// http://localhost:4000/api/v1/products/get/allproducts
/**************  Category Based All Product   *************/
router.get('/get/allproducts', async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $unwind: '$category'
            },
            {
                $lookup: {
                    from: 'subcategories',
                    localField: 'subcategory',
                    foreignField: '_id',
                    as: 'subcategory'
                }
            },
            {
                $unwind: '$subcategory'
            }
        ]);

        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching all products:", error);
        res.status(500).json({ success: false, message: "Failed to get all products!" });
    }
});



// http://localhost:4000/api/v1/products/subcatsearch?subcategories=Veg
/**************  Subcategory Veg & Non-Veg Based Searching Product   *************/
router.get('/get/subcatsearch', async (req, res) => {
    console.log("Query Parameters:", req.query);

    try {
        const filters = {};

        if (req.query.subcategories) {
            const subcategoryKeywords = req.query.subcategories.split(',').map(keyword => keyword.trim());
            console.log("Subcategory Keywords:", subcategoryKeywords);

            let subcategories;
            if (subcategoryKeywords.includes('Veg') && subcategoryKeywords.includes('Non-Veg')) {
                console.log('Both Veg and Non-Veg subcategories not allowed.');
                return res.status(400).json({
                    success: false,
                    message: 'Cannot search for both Veg and Non-Veg subcategories simultaneously.'
                });
            } else if (subcategoryKeywords.includes('Veg')) {
                subcategories = await SubCategory.find({ subcat_name: { $regex: '^Veg', $options: 'i' } });
            } else if (subcategoryKeywords.includes('Non-Veg')) {
                subcategories = await SubCategory.find({ subcat_name: { $regex: '^Non-Veg', $options: 'i' } });
            } else {
                console.log('Invalid subcategory keywords.');
                return res.status(400).json({
                    success: false,
                    message: 'Invalid subcategory keywords.'
                });
            }

            console.log("Found Subcategories:", subcategories);

            if (subcategories.length === 0) {
                console.log('No subcategories found for the given keywords.');
                return res.json({
                    success: true,
                    products: []
                });
            }

            const subcategoryIds = subcategories.map(subcat => subcat._id);
            console.log("Subcategory IDs:", subcategoryIds);

            filters.subcategory = { $in: subcategoryIds };
        } else {
            console.log('No subcategory provided.');
            return res.json({
                success: true,
                products: []
            });
        }

        console.log("Filters:", filters);

        const products = await Product.find(filters).populate('subcategory category');
        console.log("Found Products:", products);

        res.json({
            success: true,
            products
        });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
});


const csvUpload = multer({ dest: 'public/uploads/productcsv' });

router.post('/importcsvproduct', upload, csvUpload.single('import-csv-file'),  async (req, res) => {
    try {
        const results = [];
        
        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).send("No file uploaded.");
        }

        console.log("Reading CSV file...");
        
        fs.createReadStream(req.file.path)
            .pipe(csvParser())
            .on('data', (product) => results.push(product))  // Use 'data' event, not 'product'
            .on('end', async () => {
                try {
                    
                    const category = await Category.findById(req.body.category); console.log("check Category", category)
                    if(!category){
                        return res.status(404).send({ success: false, message: "Invalid Category!" });
                    } 

                    const subcategory = await SubCategory.findById(req.body.subcategory);
                    if(!subcategory){
                        return res.status(404).send({ success: false, message: "Invalid Subcategory!" });
                    }
                    console.log("Check Results",results)
                    const check = await Product.insertMany(results);
                    console.log("Check Data", check)


                    console.log("CSV data imported successfully.");
                    res.status(200).send("CSV Data Imported Successfully");
                } catch (error) {
                    console.error("Error importing data: ", error.message);
                    res.status(500).send("Error importing data: " + error.message);
                }
            })
            .on('error', (error) => {
                console.error("Error reading CSV file: ", error.message);
                res.status(500).send("Error reading CSV file: " + error.message);
            });

    } catch (error) {
        console.error("Error processing CSV upload: ", error.message);
        res.status(500).send("Error processing CSV upload: " + error.message);
    }
});


module.exports = router;
