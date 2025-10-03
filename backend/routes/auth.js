const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { validateLogin, validateUser } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUser, asyncHandler(async (req, res) => {
  const { email, password, firstName, lastName, role, phone, studentId, employeeId, department, year, hostelBlock, designation, driverLicense } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User already exists with this email'
    });
  }

  // Check for duplicate student ID or employee ID
  if (studentId) {
    const existingStudent = await User.findByStudentId(studentId);
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student ID already exists'
      });
    }
  }

  if (employeeId) {
    const existingEmployee = await User.findByEmployeeId(employeeId);
    if (existingEmployee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID already exists'
      });
    }
  }

  // Create user
  const userData = {
    email,
    password,
    firstName,
    lastName,
    role,
    phone
  };

  // Add role-specific fields
  if (role === 'student') {
    userData.studentId = studentId;
    userData.department = department;
    userData.year = year;
    userData.hostelBlock = hostelBlock;
  } else if (role === 'staff') {
    userData.employeeId = employeeId;
    userData.department = department;
    userData.designation = designation;
  } else if (role === 'driver') {
    userData.driverLicense = driverLicense;
    userData.experience = 0;
  }

  const user = await User.create(userData);

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.getPublicProfile(),
      token,
      refreshToken
    }
  });
}));

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Find user by email
  const user = await User.findByEmail(email).select('+password');
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is active
  if (!user.isActive) {
    return res.status(401).json({
      success: false,
      message: 'Account is deactivated'
    });
  }

  // Check role match
  if (user.role !== role) {
    return res.status(401).json({
      success: false,
      message: 'Invalid role for this account'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Update last login
  await user.updateLastLogin();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.getPublicProfile(),
      token,
      refreshToken
    }
  });
}));

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Logout successful'
  });
}));

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user.getPublicProfile()
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', authenticateToken, asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, preferences } = req.body;
  const userId = req.user._id;

  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: user.getPublicProfile()
    }
  });
}));

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user._id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Current password and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  const user = await User.findById(userId).select('+password');
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // In a real application, you would:
  // 1. Generate a password reset token
  // 2. Send an email with the reset link
  // 3. Store the token in the database with an expiration

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
}));

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: 'Token and new password are required'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'New password must be at least 6 characters long'
    });
  }

  // In a real application, you would:
  // 1. Verify the reset token
  // 2. Check if it's not expired
  // 3. Update the user's password
  // 4. Invalidate the token

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
}));

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Verification token is required'
    });
  }

  // In a real application, you would:
  // 1. Verify the email verification token
  // 2. Update the user's email verification status

  res.json({
    success: true,
    message: 'Email verified successfully'
  });
}));

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Private
router.post('/resend-verification', authenticateToken, asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      message: 'Email is already verified'
    });
  }

  // In a real application, you would:
  // 1. Generate a new verification token
  // 2. Send verification email

  res.json({
    success: true,
    message: 'Verification email sent'
  });
}));

module.exports = router;
