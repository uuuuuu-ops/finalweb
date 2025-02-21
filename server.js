// server.js
require('dotenv').config();
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
const express = require('express');
const session = require('express-session');
const path = require('path');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const recipeRoutes = require('./routes/recipes');




const app = express();

// Connect to MongoDB Atlas
connectDB(process.env.MONGODB_URI);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            // secure: true, // enable for HTTPS in production
            maxAge: 1000 * 60 * 60, // 1 hour
        }
    })
);

// EJS
app.set('view engine', 'ejs');

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


// Pass session to all views
app.use((req, res, next) => {
    res.locals.session = req.session; // Makes session available globally in all templates
    next();
});

// Routes
app.use('/', (req, res, next) => {
    if (req.path === '/') {
        return res.render('index');
    }
    next();
});
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/admin', adminRoutes);
app.use('/recipes', recipeRoutes);
// Handle 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
