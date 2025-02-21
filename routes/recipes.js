const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/authMiddleware');
const path = require('path');

// Setup Multer for file uploads (Move this to the top)
const storage = multer.diskStorage({
    destination: './public/uploads/', // Store images in public/uploads folder
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage }); // ✅ Define before usage

// GET: Show all user recipes
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const recipes = await Recipe.find({ userId: req.session.userId });
        res.render('recipes', { recipes }); // ✅ Pass the recipes array to EJS
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// GET: Show form to add a new recipe
router.get('/add', isAuthenticated, (req, res) => {
    res.render('add-recipe');
});

// POST: Add a new recipe
router.post('/add', isAuthenticated, upload.single('image'), async (req, res) => {
    try {
        console.log("Received form data:", req.body); // ✅ Debugging log
        console.log("Uploaded file:", req.file); // ✅ Check uploaded file

        const { title, ingredients, instructions } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null; // Save image path

        if (!title || !ingredients || !instructions) {
            return res.status(400).send("All fields are required.");
        }

        const newRecipe = new Recipe({
            userId: req.session.userId,
            title,
            ingredients,
            instructions,
            image
        });

        await newRecipe.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

router.get('/edit/:id', isAuthenticated, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe || recipe.userId.toString() !== req.session.userId) {
            return res.status(403).send('Unauthorized');
        }

        console.log("Editing Recipe:", recipe); // ✅ Debugging

        res.render('edit-recipe', { recipe }); // ✅ Render correct view
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

// POST: Update recipe
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, ingredients, instructions } = req.body;

        if (!title || !ingredients || !instructions) {
            return res.status(400).send("All fields are required!");
        }

        let updateData = { title, ingredients, instructions };

        // If a new image is uploaded, update the image field
        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const updatedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updateData, { 
            new: true, // Return updated document
            runValidators: true  // Ensure Mongoose validation runs
        });

        if (!updatedRecipe) {
            return res.status(404).send("Recipe not found");
        }

        console.log("Updated Recipe:", updatedRecipe);

        res.redirect('/recipes');  // Redirect to the recipe list
    } catch (error) {
        console.error(error);
        res.status(500).send("Error updating recipe");
    }
});



// GET: Delete a recipe
router.post('/delete/:id', isAuthenticated, async (req, res) => {
    try {
        await Recipe.findByIdAndDelete(req.params.id);
        res.redirect('/recipes'); // Redirect back to recipes list
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
