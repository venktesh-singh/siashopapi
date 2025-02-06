const User    = require('../models/user');
const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs'); 
const jwt     = require('jsonwebtoken');

router.get(`/`, async (req, res) => {
    try {
        const users = await User.find().sort({ dateCreated: -1 });
        res.status(200).send(users);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});  

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id);
    if(!user){
        return res.status(500).send("User Not Found!");
    }
    res.status(200).send(user);
})

router.post('/add', async (req, res) => {
    try {
        const { username, email, password, phone, isAdmin, street, apartment, zip, city, country } = req.body;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            username,
            email,
            passwordHash: hashedPassword,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            city,
            country,
        });

        const savedUser = await user.save();
        res.status(201).json({ success: true, message: "User created successfully!", user: savedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "User cannot be created!", error: err.message });
    }
});

// PUT route to update an existing user
router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, passwordHash, phone, isAdmin, street, apartment, zip, city, country } = req.body;

        const updateData = {
            username,
            email,
            phone,
            isAdmin,
            street,
            apartment,
            zip,
            city,
            country,
        };

        if (passwordHash) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(passwordHash, salt);
            updateData.passwordHash = hashedPassword;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
    } catch (err) {
        res.status(500).json({ success: false, message: "User cannot be updated", error: err.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).send("Email ID cannot be found");
        }

        const isMatch = bcrypt.compareSync(req.body.password, user.passwordHash); 
        
        if (isMatch) {
            const token = jwt.sign(
                {
                    userId: user.id,
                    isAdmin: user.isAdmin
                },
                process.env.SECRET,
                { expiresIn: '1d' }
            );
            return res.status(200).send({ user: user.email, token: token, isAdmin: user.isAdmin });
        } else {
            return res.status(400).send("Password is incorrect!");
        }
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
});



router.delete('/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "User deleted successfully!"
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});


router.get('/get/counts', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        console.log("User Count:",userCount)
        if (userCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        res.status(200).json({
            success: true,
            userCount: userCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User count failed",
            error: error.message
        });
    }
});

router.put('/status/update/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;

        if (!['Pending', 'Approve', 'Reject'].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updateStatus = await User.findByIdAndUpdate(
            userId,
            { status },
            { new: true }
        );

        if (!updateStatus) {
            return res.status(404).json({ message: "User not found, status not updated!" });
        }

        res.status(200).json({ message: "Status updated successfully", user: updateStatus });
    } catch (error) {
        console.error('Error updating status:', error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router
