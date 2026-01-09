const jwt = require('jsonwebtoken');
const User = require('../models/User');

/* =========================================
   MIDDLEWARE: PROTECT ROUTE
   Verifies the JWT token in the header
   ========================================= */
const protect = async (req, res, next) => {
    let token;

    // 1. Check if the "Authorization" header exists and starts with "Bearer"
    // Format: "Bearer <token_string>"
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // 2. Get the token from the header (remove "Bearer " string)
            token = req.headers.authorization.split(' ')[1];

            // 3. Verify the token signature
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_dev_key_123');

            // 4. Find the user in DB associated with this token
            // We exclude the password from the result for safety
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ success: false, message: 'User not found' });
            }

            // 5. Proceed to the next middleware/controller
            next();

        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

/* =========================================
   MIDDLEWARE: ADMIN ONLY (Optional Future Use)
   ========================================= */
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };