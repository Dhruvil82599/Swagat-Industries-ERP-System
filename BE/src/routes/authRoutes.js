const express = require('express');
const router = express.Router();
const { login, getMe, logout, changePassword } = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public route
router.post('/login', login);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);
router.post('/change-password', authMiddleware, changePassword);

module.exports = router;
