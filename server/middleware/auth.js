const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ecoscan_super_secret_key_2026';

const authMiddleware = (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization');

    // Check if no token
    if (!token) {
        return res.status(401).json({ error: 'No token, authorization denied' });
    }

    try {
        // Verify token
        // Usually token comes as "Bearer <token>"
        const tokenString = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        const decoded = jwt.verify(tokenString, JWT_SECRET);
        
        // Add user from payload
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
