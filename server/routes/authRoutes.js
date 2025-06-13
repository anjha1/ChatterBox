// server/routes/authRoutes.js
const express = require('express');
const { registerUser, loginUser, getUserProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes for user registration and login
router.post('/register', registerUser);
router.post('/login', loginUser); // Login will primarily involve Firebase client-side,
                                  // but this can be used to create/update user in backend DB.

// Protected route to get user profile
router.get('/profile', protect, getUserProfile);

module.exports = router;
