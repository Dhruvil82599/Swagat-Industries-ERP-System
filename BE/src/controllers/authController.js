const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse } = require('../utils/response');
const { sendOtpEmail } = require('../utils/mailer');

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

const verifyCurrentPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword } = req.body;

    if (!currentPassword) {
      return errorResponse(res, 'Current password is required.', 400);
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

    return successResponse(res, { isValid: true }, 'Current password verified successfully');
  } catch (error) {
    console.error('verifyCurrentPassword error:', error);
    return errorResponse(res, 'Failed to verify current password.', 500);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body; // Can be username or email

    if (!identifier || !identifier.trim()) {
      return errorResponse(res, 'Username or Email address is required.', 400);
    }

    const searchStr = identifier.trim();

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: searchStr },
          { email: searchStr }
        ]
      }
    });

    if (!user) {
      // Return success to prevent enumeration attack, but notify if user is test admin
      return successResponse(
        res,
        { emailSent: true },
        'If an account exists for this username/email, a verification code has been sent.'
      );
    }

    // Generate 6-digit random numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

    // Save OTP to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: otpExpires
      }
    });

    // Get company settings email as fallback if user has no email set
    const companySetting = await prisma.companySetting.findFirst();
    const fallbackEmail = (companySetting && companySetting.email && companySetting.email.trim())
      ? companySetting.email.trim()
      : `${user.username}@swagatindustries.com`;

    const targetEmail = user.email || fallbackEmail;

    // Send email via mailer utility
    const mailResult = await sendOtpEmail(targetEmail, user.username, otp);

    return successResponse(
      res,
      {
        username: user.username,
        emailMasked: targetEmail.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + '*'.repeat(gp3.length)),
        devSimulated: mailResult.simulated || false,
        devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined
      },
      'Verification OTP code sent successfully to registered email.'
    );
  } catch (error) {
    console.error('forgotPassword error:', error);
    return errorResponse(res, 'Failed to process forgot password request.', 500);
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return errorResponse(res, 'Username and OTP code are required.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return errorResponse(res, 'Invalid or expired OTP code request.', 400);
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      return errorResponse(res, 'Verification OTP code has expired. Please request a new code.', 400);
    }

    if (user.resetOtp !== otp.trim()) {
      return errorResponse(res, 'Invalid 6-digit verification code. Please check and try again.', 400);
    }

    return successResponse(res, { verified: true }, 'OTP code verified successfully.');
  } catch (error) {
    console.error('verifyOtp error:', error);
    return errorResponse(res, 'Failed to verify OTP code.', 500);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    if (!username || !otp || !newPassword) {
      return errorResponse(res, 'All fields are required.', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { username: username.trim() }
    });

    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return errorResponse(res, 'Invalid password reset session.', 400);
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      return errorResponse(res, 'Verification OTP code has expired. Please request a new code.', 400);
    }

    if (user.resetOtp !== otp.trim()) {
      return errorResponse(res, 'Invalid verification code.', 400);
    }

    // Hash new password and clear reset fields
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetOtp: null,
        resetOtpExpires: null
      }
    });

    return successResponse(res, null, 'Password reset successfully! You can now sign in with your new password.');
  } catch (error) {
    console.error('resetPassword error:', error);
    return errorResponse(res, 'Failed to reset password.', 500);
  }
};

module.exports = {
  login,
  getMe,
  logout,
  changePassword,
  verifyCurrentPassword,
  forgotPassword,
  verifyOtp,
  resetPassword
};
