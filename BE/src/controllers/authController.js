const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { username, password, captcha } = req.body;

    if (!username || !username.trim()) {
      return errorResponse(res, 'Username is required.', 400);
    }
    if (!password) {
      return errorResponse(res, 'Password is required.', 400);
    }
    if (!captcha || !captcha.trim()) {
      return errorResponse(res, 'CAPTCHA verification code is required.', 400);
    }

    const trimmedUsername = username.trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { username: trimmedUsername }
    });

    if (!user) {
      // Generic message to prevent username enumeration
      return errorResponse(res, 'Invalid username or password.', 401);
    }

    // Verify password hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid username or password.', 401);
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'swagat_erp_jwt_secret_key_2026_super_secure';
    const payload = {
      id: user.id,
      username: user.username,
      fullName: user.fullName || 'Swagat Administrator',
      role: user.role || 'ADMIN'
    };

    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    return successResponse(
      res,
      {
        user: payload,
        token
      },
      'Authentication successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'An error occurred during authentication. Please try again.', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User profile not found.', 404);
    }

    return successResponse(res, user, 'Authenticated user profile retrieved');
  } catch (error) {
    console.error('getMe error:', error);
    return errorResponse(res, 'Failed to fetch user profile.', 500);
  }
};

const logout = async (req, res) => {
  return successResponse(res, null, 'Logged out successfully');
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return errorResponse(res, 'Current password is required.', 400);
    }
    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return errorResponse(res, 'User profile not found.', 404);
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return errorResponse(res, 'Current password is incorrect.', 400);
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });

    return successResponse(res, null, 'Password updated successfully');
  } catch (error) {
    console.error('changePassword error:', error);
    return errorResponse(res, 'Failed to update password.', 500);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  changePassword
};
