const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize, canAccessResource } = require('../middleware/auth');
const { validateObjectId, validatePagination, validateSearch } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
router.get('/', authorize('admin'), validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'createdAt';
  const order = req.query.order || 'desc';
  const role = req.query.role;
  const search = req.query.q;

  // Build query
  let query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { studentId: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const users = await User.find(query)
    .select('-password')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', validateObjectId(), canAccessResource('user'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: { user }
  });
}));

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', validateObjectId(), canAccessResource('user'), asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, preferences, isActive } = req.body;
  const userId = req.params.id;
  const currentUser = req.user;

  // Only admin can update isActive status
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (phone) updateData.phone = phone;
  if (preferences) updateData.preferences = preferences;
  
  if (isActive !== undefined && currentUser.role === 'admin') {
    updateData.isActive = isActive;
  }

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
}));

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
router.delete('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Don't actually delete, just deactivate
  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'User deactivated successfully'
  });
}));

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await User.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        verifiedUsers: {
          $sum: { $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0] }
        },
        roleCounts: {
          $push: {
            role: '$role',
            isActive: '$isActive'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalUsers: 1,
        activeUsers: 1,
        verifiedUsers: 1,
        inactiveUsers: { $subtract: ['$totalUsers', '$activeUsers'] },
        unverifiedUsers: { $subtract: ['$totalUsers', '$verifiedUsers'] },
        roleBreakdown: {
          $reduce: {
            input: '$roleCounts',
            initialValue: {
              student: { total: 0, active: 0 },
              staff: { total: 0, active: 0 },
              driver: { total: 0, active: 0 },
              admin: { total: 0, active: 0 }
            },
            in: {
              $let: {
                vars: {
                  role: '$$this.role',
                  isActive: '$$this.isActive'
                },
                in: {
                  $mergeObjects: [
                    '$$value',
                    {
                      $arrayToObject: [
                        [
                          {
                            k: '$$role',
                            v: {
                              total: {
                                $add: [
                                  { $getField: { field: 'total', input: { $getField: { field: '$$role', input: '$$value' } } } },
                                  1
                                ]
                              },
                              active: {
                                $add: [
                                  { $getField: { field: 'active', input: { $getField: { field: '$$role', input: '$$value' } } } },
                                  { $cond: ['$$isActive', 1, 0] }
                                ]
                              }
                            }
                          }
                        ]
                      ]
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalUsers: 0,
      activeUsers: 0,
      verifiedUsers: 0,
      inactiveUsers: 0,
      unverifiedUsers: 0,
      roleBreakdown: {
        student: { total: 0, active: 0 },
        staff: { total: 0, active: 0 },
        driver: { total: 0, active: 0 },
        admin: { total: 0, active: 0 }
      }
    }
  });
}));

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (Admin only)
router.get('/role/:role', authorize('admin'), validatePagination, asyncHandler(async (req, res) => {
  const { role } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  if (!['student', 'staff', 'driver', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid role'
    });
  }

  const users = await User.find({ role })
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments({ role });

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Search users
// @route   GET /api/users/search
// @access  Private (Admin only)
router.get('/search', authorize('admin'), validateSearch, asyncHandler(async (req, res) => {
  const { q, type, role } = req.query;
  const limit = parseInt(req.query.limit) || 20;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  let query = {
    $or: [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { studentId: { $regex: q, $options: 'i' } },
      { employeeId: { $regex: q, $options: 'i' } }
    ]
  };

  if (role) {
    query.role = role;
  }

  if (type) {
    switch (type) {
      case 'student':
        query.studentId = { $exists: true, $ne: null };
        break;
      case 'staff':
        query.employeeId = { $exists: true, $ne: null };
        break;
      case 'driver':
        query.driverLicense = { $exists: true, $ne: null };
        break;
    }
  }

  const users = await User.find(query)
    .select('-password')
    .limit(limit)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: { users }
  });
}));

// @desc    Get user activity
// @route   GET /api/users/:id/activity
// @access  Private (Admin only)
router.get('/:id/activity', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // In a real application, you would track user activity
  // For now, we'll return basic info
  const activity = {
    lastLogin: user.lastLogin,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };

  res.json({
    success: true,
    data: { activity }
  });
}));

// @desc    Bulk update users
// @route   PUT /api/users/bulk
// @access  Private (Admin only)
router.put('/bulk', authorize('admin'), asyncHandler(async (req, res) => {
  const { userIds, updateData } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User IDs array is required'
    });
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Update data is required'
    });
  }

  const result = await User.updateMany(
    { _id: { $in: userIds } },
    updateData
  );

  res.json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`,
    data: {
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    }
  });
}));

module.exports = router;
