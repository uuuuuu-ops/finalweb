// controllers/userController.js
const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const bcrypt = require('bcrypt');

module.exports = {
    registerUser: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            console.log('Incoming registration request:', { name, email, password });

            if (!name || !email || !password) {
                console.log('Validation error: missing fields');
                return res.render('register', { error: 'All fields are required.', name, email });
            }

            if (password.length < 6) {
                console.log('Validation error: password too short');
                return res.render('register', { error: 'Password must be at least 6 characters.', name, email });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log('Validation error: email already in use');
                return res.render('register', { error: 'Email already in use.', name, email });
            }

            console.log('Creating new user...');
            const newUser = new User({ name, email, password });
            await newUser.save();
            console.log('User created successfully:', newUser);

            req.session.userId = newUser._id;
            req.session.role = newUser.role;
            req.session.name = newUser.name;

            return res.redirect('/dashboard');
        } catch (error) {
            console.error('Error in registration:', error);
            return res.status(500).send('Server error');
        }
    },

    loginUser: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.render('login', { error: 'Please provide email and password.' });
            }

            const user = await User.findOne({ email });
            if (!user) {
                return res.render('login', { error: 'Invalid email or password.' });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                return res.render('login', { error: 'Invalid email or password.' });
            }

            // Create session
            req.session.userId = user._id;
            req.session.role = user.role;
            req.session.name = user.name;

            return res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },

    logoutUser: (req, res) => {
        req.session.destroy((err) => {
            if (err) console.error(err);
            res.clearCookie('connect.sid');
            return res.redirect('/login');
        });
    },

    // Password reset request
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.render('forgot-password', { error: 'No account with that email exists.' });
            }

            const token = crypto.randomBytes(20).toString('hex');
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            const resetUrl = `http://${req.headers.host}/reset-password/${token}`;
            const message = `You are receiving this email because you (or someone else) requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}`;

            await sendEmail({
                email: user.email,
                subject: 'Password Reset',
                message,
            });

            res.render('forgot-password', { success: 'An email has been sent with further instructions.' });
        } catch (error) {
            console.error('Error in forgotPassword:', error);
            res.status(500).render('forgot-password', { error: 'An error occurred while sending the email. Please try again later.' });
        }
    },

    // Show reset form based on token
    resetPasswordForm: async (req, res) => {
        try {
            const { token } = req.params;
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });
            if (!user) {
                return res.render('login', { error: 'Password reset token is invalid or has expired.' });
            }
            res.render('reset-password', { token });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },

    // Handle new password
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;

            if (!password || !confirmPassword) {
                return res.render('reset-password', { error: 'All fields are required.', token });
            }

            if (password !== confirmPassword) {
                return res.render('reset-password', { error: 'Passwords do not match.', token });
            }

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.render('login', { error: 'Password reset token is invalid or has expired.' });
            }

            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            return res.redirect('/login');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },
};
