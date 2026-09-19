const express = require('express');
const router = express.Router();
const {
  login,
  getMe,
  logout,
  changePassword,
  verifyCurrentPassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyInviteCode,
  completeInviteRegistration,
} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/verify-invite', verifyInviteCode);
router.post('/complete-invite-registration', completeInviteRegistration);

// Protected routes
router.get('/me', authMiddleware, getMe);
router.post('/logout', authMiddleware, logout);
router.post('/change-password', authMiddleware, changePassword);
router.post('/verify-current-password', authMiddleware, verifyCurrentPassword);

module.exports = router;

