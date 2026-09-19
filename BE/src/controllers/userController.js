const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { successResponse, errorResponse } = require('../utils/response');
const { sendInviteEmail } = require('../utils/mailer');

const prisma = new PrismaClient();

// Get all registered users
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('getAllUsers error:', error);
    return errorResponse(res, 'Failed to fetch users.', 500);
  }
};

// Get all pending user invitations
const getAllInvitations = async (req, res) => {
  try {
    const invitations = await prisma.userInvitation.findMany({
      where: { isUsed: false },
      orderBy: { createdAt: 'desc' },
    });
    return successResponse(res, invitations, 'Pending invitations retrieved successfully');
  } catch (error) {
    console.error('getAllInvitations error:', error);
    return errorResponse(res, 'Failed to fetch pending invitations.', 500);
  }
};

// Send user invitation email with 6-digit code
const sendInvite = async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email || !email.trim()) {
      return errorResponse(res, 'Email address is required for sending an invitation.', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: cleanEmail }
    });
    if (existingUser) {
      return errorResponse(res, 'A user with this email address is already registered.', 400);
    }

    // Generate 6-digit invite code
    const inviteCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours expiry

    // Save invitation to database
    const invitation = await prisma.userInvitation.create({
      data: {
        email: cleanEmail,
        fullName: fullName ? fullName.trim() : '',
        code: inviteCode,
        expiresAt,
        isUsed: false,
      }
    });

    // Send email via mailer
    const mailResult = await sendInviteEmail(cleanEmail, fullName, inviteCode);

    return successResponse(
      res,
      {
        invitation,
        devSimulated: mailResult.simulated || false,
        devInviteCode: process.env.NODE_ENV !== 'production' ? inviteCode : undefined,
      },
      'User invitation sent successfully!'
    );
  } catch (error) {
    console.error('sendInvite error:', error);
    return errorResponse(res, 'Failed to send invitation.', 500);
  }
};

// Admin directly creates a new user account
const createUser = async (req, res) => {
  try {
    const { username, email, fullName, password } = req.body;

    if (!username || !username.trim()) {
      return errorResponse(res, 'Username is required.', 400);
    }
    if (!password || password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long.', 400);
    }

    const cleanUsername = username.trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // Check unique username
    const existingUsername = await prisma.user.findUnique({
      where: { username: cleanUsername }
    });
    if (existingUsername) {
      return errorResponse(res, 'Username is already taken. Please choose another.', 400);
    }

    // Check unique email if provided
    if (cleanEmail) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: cleanEmail }
      });
      if (existingEmail) {
        return errorResponse(res, 'An account with this email address already exists.', 400);
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: cleanUsername,
        email: cleanEmail,
        fullName: fullName ? fullName.trim() : null,
        passwordHash,
        role: 'ADMIN', // Standard admin access
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      }
    });

    return successResponse(res, newUser, 'New user created successfully');
  } catch (error) {
    console.error('createUser error:', error);
    return errorResponse(res, 'Failed to create user.', 500);
  }
};

// Admin resets a user's password
const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return errorResponse(res, 'New password must be at least 6 characters long.', 400);
    }

    const id = parseInt(userId, 10);
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newHash }
    });

    return successResponse(res, null, `Password for ${user.username} has been reset successfully.`);
  } catch (error) {
    console.error('resetUserPassword error:', error);
    return errorResponse(res, 'Failed to reset password.', 500);
  }
};

// Delete user account
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const id = parseInt(userId, 10);

    // Prevent deleting self
    if (req.user && req.user.id === id) {
      return errorResponse(res, 'You cannot delete your own active account.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return errorResponse(res, 'User not found.', 404);
    }

    await prisma.user.delete({ where: { id } });

    return successResponse(res, null, `User account ${user.username} has been removed.`);
  } catch (error) {
    console.error('deleteUser error:', error);
    return errorResponse(res, 'Failed to delete user.', 500);
  }
};

// Cancel pending invitation
const cancelInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const id = parseInt(inviteId, 10);

    await prisma.userInvitation.delete({ where: { id } });
    return successResponse(res, null, 'Invitation cancelled successfully.');
  } catch (error) {
    console.error('cancelInvitation error:', error);
    return errorResponse(res, 'Failed to cancel invitation.', 500);
  }
};

// Update existing user details (Full Name, Username, Email)
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, fullName } = req.body;

    const id = parseInt(userId, 10);
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
      return errorResponse(res, 'User profile not found.', 404);
    }

    if (!username || !username.trim()) {
      return errorResponse(res, 'Username is required.', 400);
    }

    const cleanUsername = username.trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : null;

    // Check if username is taken by another user
    if (cleanUsername !== existingUser.username) {
      const userCheck = await prisma.user.findUnique({
        where: { username: cleanUsername }
      });
      if (userCheck) {
        return errorResponse(res, 'Username is already taken by another account.', 400);
      }
    }

    // Check if email is taken by another user
    if (cleanEmail && cleanEmail !== existingUser.email) {
      const emailCheck = await prisma.user.findFirst({
        where: { email: cleanEmail }
      });
      if (emailCheck) {
        return errorResponse(res, 'Email address is already taken by another account.', 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        username: cleanUsername,
        email: cleanEmail,
        fullName: fullName ? fullName.trim() : null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      }
    });

    return successResponse(res, updatedUser, 'User profile updated successfully.');
  } catch (error) {
    console.error('updateUser error:', error);
    return errorResponse(res, 'Failed to update user profile.', 500);
  }
};

module.exports = {
  getAllUsers,
  getAllInvitations,
  sendInvite,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  cancelInvitation,
};

