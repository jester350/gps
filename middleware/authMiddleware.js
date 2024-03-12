const config = require('/opt/gps/.secrets/config.js'); // Adjust the path as needed

// Token-based authentication middleware
const tokenMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // If no token, deny access

    // Here, you'd typically verify the token. This is just a placeholder.
    // You might use a library like jsonwebtoken (jwt) for actual token verification.
    if (token === config.token) {
        next(); // Token is valid; proceed to the next middleware/route handler
    } else {
        return res.sendStatus(403); // Invalid token; deny access
    }
};

// Middleware to check if the user is logged in
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        // If there is no session userId set, the user is not logged in
        return res.status(401).send('You must be logged in to access this page');
    }
    next(); // User is logged in; proceed to the next middleware/route handler
};

module.exports = { tokenMiddleware, requireLogin };
