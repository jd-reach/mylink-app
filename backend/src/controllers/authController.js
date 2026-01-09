const User = require('../models/User');
const jwt = require('jsonwebtoken');

/* =========================================
   HELPER: GENERATE JWT TOKEN
   ========================================= */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_dev_key_123', {
        expiresIn: '30d' // User stays logged in for 30 days
    });
};

/* =========================================
   CONTROLLER: REGISTER USER
   POST /api/auth/register
   ========================================= */
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Check if user exists (by email OR username)
        const userExists = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (userExists) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with that email or username already exists' 
            });
        }

        // 2. Create the user
        const user = await User.create({
            username,
            email,
            password
        });

        // 3. Send response with Token
        if (user) {
            res.status(201).json({
                success: true,
                _id: user._id,
                username: user.username,
                email: user.email,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

/* =========================================
   CONTROLLER: LOGIN USER
   POST /api/auth/login
   ========================================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check for email
        // We explicitly select '+password' because we set select:false in the model
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 2. Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // 3. Send response with Token
        res.json({
            success: true,
            _id: user._id,
            username: user.username,
            email: user.email,
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/* =========================================
   CONTROLLER: GET CURRENT USER
   GET /api/auth/me
   Private Route (Requires Token)
   ========================================= */
exports.getMe = async (req, res) => {
    try {
        // req.user is set by the authMiddleware (which we will build next)
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};