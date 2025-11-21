const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../middleware/auth');
const { validateLogin, validateUser } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const { sendEmail } = require('../utils/email');

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

const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

// Rate limiter for forgot password to prevent abuse (per IP)
const forgotLimiter = rateLimit({
  windowMs: Number(process.env.FORGOT_RATE_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000), // default 1 hour
  max: Number(process.env.FORGOT_RATE_MAX || 5), // default 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: true, message: 'If an account with that email exists, a password reset link has been sent' }
});

// Rate limiter for reset endpoint to slow brute force
const resetLimiter = rateLimit({
  windowMs: Number(process.env.RESET_RATE_WINDOW_MS || process.env.RATE_LIMIT_WINDOW_MS || 60 * 60 * 1000),
  max: Number(process.env.RESET_RATE_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts, please try again later' }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', forgotLimiter, asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  const user = await User.findByEmail(email);

  // Always respond with 200 to avoid user enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate raw token and hashed token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Set token and expiry (10 minutes)
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Prepare reset link
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4028';
  const resetLink = `${frontendUrl.replace(/\/+$/, '')}/reset-password?token=${rawToken}`;

  // Send email (best-effort). If send fails, we still return success to client.
  try {
    const html = `
      <p>You requested a password reset for your KIET Traveller account.</p>
      <p>Click the button below to reset your password. This link will expire in 10 minutes.</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:10px 16px;background:#1f7aed;color:white;border-radius:6px;text-decoration:none">Reset Password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: 'KIET Traveller — Password Reset',
      html,
      text: `Reset your password: ${resetLink}`
    });
  } catch (err) {
    console.error('Error sending password reset email', err);
    // swallow error
  }

  return res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
}));

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', resetLimiter, asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

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

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user with matching token and not expired
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() }
  }).select('+password');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset token'
    });
  }

  // Update password and clear reset fields
  user.password = newPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpire = null;
  await user.save();

  return res.json({
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

// @desc    Test email endpoint (for debugging)
// @route   POST /api/auth/test-email
// @access  Public
router.post('/test-email', asyncHandler(async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({ success: false, message: 'Email required' });
  }

  try {
    await sendEmail({
      to,
      subject: 'KIET Traveller — Test Email',
      html: '<p>This is a test email from KIET Traveller password reset system.</p>',
      text: 'This is a test email.'
    });

    res.json({ success: true, message: 'Test email sent (check logs for details)' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
}));

module.exports = router;
