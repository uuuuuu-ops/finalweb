// routes/admin.js
const User = require('../models/User');  // Ensure the path is correct
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/authMiddleware'); // custom middleware
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('../controllers/adminController');

// GET /admin -> Admin dashboard homepage (could be a redirect or summary page)
// Example route for admin dashboard
router.get('/', isAdmin, (req, res) => {
    res.render('admin-dashboard', {
        name: req.session.name,
        session: req.session // Pass the session object explicitly
    });
});


router.get('/users', isAdmin, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 5,
            sortField = 'name',
            sortOrder = 'asc',
            search = ''
        } = req.query;

        const query = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(query)
            .sort({ [sortField]: sortOrder === 'asc' ? 1 : -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const totalCount = await User.countDocuments(query);
        const totalPages = Math.ceil(totalCount / limit);

        res.render('admin-users', {
            users,
            currentPage: Number(page),
            totalPages,
            limit: Number(limit),
            sortField,
            sortOrder,
            search
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


// GET /admin/users -> Show paginated user list with search & sort
router.get('/users', isAdmin, getAllUsers);

// GET /admin/users/:id -> Show user edit form
router.get('/users/:id', isAdmin, getUserById);

// POST (or PATCH) /admin/users/:id -> Update user info
router.post('/users/:id', isAdmin, updateUser);

// POST/GET /admin/users/delete/:id -> Delete a user
router.post('/users/delete/:id', isAdmin, deleteUser);

module.exports = router;
