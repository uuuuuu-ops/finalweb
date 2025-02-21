// middleware/authMiddleware.js


function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    }
    return res.redirect('/login'); 
}


function isAdmin(req, res, next) {
    if (req.session.userId && req.session.role === 'admin') {
        return next();
    }
    return res.redirect('/dashboard');  
}

module.exports = {
    isAuthenticated,
    isAdmin
};
