const express = require('express');
const router = express.Router();
const { 
    updateProfile, 
    addLink, 
    deleteLink, 
    getPublicProfile 
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

/* =========================================
   PUBLIC ROUTES
   (No login required)
   ========================================= */

// @route   GET /api/users/:username
// @desc    Get public profile data
// @access  Public
router.get('/:username', getPublicProfile);

/* =========================================
   PROTECTED ROUTES
   (Requires "Bearer <token>" header)
   ========================================= */

// @route   PUT /api/users/profile
// @desc    Update bio, avatar, theme
router.put('/profile', protect, updateProfile);

// @route   POST /api/users/links
// @desc    Add a new link
router.post('/links', protect, addLink);

// @route   DELETE /api/users/links/:id
// @desc    Delete a link by ID
router.delete('/links/:id', protect, deleteLink);

module.exports = router;