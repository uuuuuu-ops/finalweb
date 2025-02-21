// routes/auth.js
const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPasswordForm,
    resetPassword
} = require('../controllers/userController');

// Registration
router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', registerUser);

// Login
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', loginUser);

// Logout
router.get('/logout', logoutUser);

// Forgot Password
router.get('/forgot-password', (req, res) => {
    res.render('forgot-password');
});
router.post('/forgot-password', forgotPassword);

// Reset Password
router.get('/reset-password/:token', resetPasswordForm);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
