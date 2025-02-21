const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe'); 
const User = require('../models/User'); // Ensure the User model is imported
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET: /dashboard -> User dashboard with search, sorting, and pagination
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Fetch user's recipes
        const recipes = await Recipe.find({ userId: req.session.userId });

        res.render('dashboard', {
            name: user.name,
            email: user.email,
            role: user.role,
            recipes 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// GET: Show the edit form for the logged-in user
router.get('/edit', isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.render('edit-user', { user });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// POST: Handle the form submission and update user data
router.post('/edit', isAuthenticated, async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update user fields
        user.name = name;
        user.email = email;

        if (password) {
            const bcrypt = require('bcrypt');
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        await user.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
