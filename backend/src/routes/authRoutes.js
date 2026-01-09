const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');

// We will create this middleware in the next step to protect the '/me' route
const { protect } = require('../middleware/authMiddleware'); 

/* =========================================
   PUBLIC ROUTES
   (Anyone can access these)
   ========================================= */

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', login);

/* =========================================
   PROTECTED ROUTES
   (Requires Login Token)
   ========================================= */

// @route   GET /api/auth/me
// @desc    Get current logged in user
router.get('/me', protect, getMe); // We will uncomment this after creating the middleware

module.exports = router;