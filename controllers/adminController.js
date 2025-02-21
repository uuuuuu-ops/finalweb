// controllers/adminController.js
const User = require('../models/User');

module.exports = {
    // GET: /admin/users
    getAllUsers: async (req, res) => {
        try {
            // 1) Parse query params for pagination, sorting, and search
            const {
                page = 1,
                limit = 5,
                sortField = 'name',
                sortOrder = 'asc',
                search = ''
            } = req.query;

            // 2) Build query object for search (case-insensitive on name or email)
            let query = {};
            if (search) {
                query = {
                    $or: [
                        { name: { $regex: search, $options: 'i' } },
                        { email: { $regex: search, $options: 'i' } },
                    ],
                };
            }

            // 3) Build sort object
            const sortOptions = {};
            sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

            // 4) Convert page/limit to numbers
            const pageNum = parseInt(page) || 1;
            const limitNum = parseInt(limit) || 5;
            const skip = (pageNum - 1) * limitNum;

            // 5) Fetch data
            const users = await User.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(limitNum);

            // 6) Count total docs for pagination
            const totalCount = await User.countDocuments(query);
            const totalPages = Math.ceil(totalCount / limitNum);

            // 7) Render admin users page
            return res.render('admin-users', {
                users,
                currentPage: pageNum,
                totalPages,
                limit: limitNum,
                sortField,
                sortOrder,
                search
            });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },

    // GET: /admin/users/:id
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).send('User not found');
            }
            return res.render('admin-user-edit', { user });
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },

    // POST: /admin/users/:id
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            // For example, you can allow admin to change name, role, etc.
            const { name, email, role } = req.body;
            const user = await User.findByIdAndUpdate(id, { name, email, role }, { new: true });
            if (!user) {
                return res.status(404).send('User not found');
            }
            return res.redirect('/admin/users');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    },

    // POST: /admin/users/delete/:id
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            await User.findByIdAndDelete(id);
            return res.redirect('/admin/users');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Server error');
        }
    }
};
