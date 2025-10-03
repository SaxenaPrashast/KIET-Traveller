const express = require('express');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateNotification, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', authenticateToken, validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const type = req.query.type;
  const priority = req.query.priority;
  const isRead = req.query.isRead;

  let query = {
    recipients: req.user._id,
    isActive: true
  };

  if (type) {
    query.type = type;
  }

  if (priority) {
    query.priority = priority;
  }

  if (isRead !== undefined) {
    // This would require a separate read status tracking
    // For now, we'll just return all notifications
  }

  const notifications = await Notification.find(query)
    .populate('relatedSchedule', 'route bus driver')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber registrationNumber')
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
router.get('/:id', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id)
    .populate('recipients', 'firstName lastName email')
    .populate('relatedSchedule', 'route bus driver')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber registrationNumber')
    .populate('createdBy', 'firstName lastName');

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user is a recipient
  const isRecipient = notification.recipients.some(
    recipient => recipient._id.toString() === req.user._id.toString()
  );

  if (!isRecipient && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.json({
    success: true,
    data: { notification }
  });
}));

// @desc    Create notification
// @route   POST /api/notifications
// @access  Private (Admin only)
router.post('/', authorize('admin'), validateNotification, asyncHandler(async (req, res) => {
  const notificationData = req.body;
  notificationData.createdBy = req.user._id;

  const notification = await Notification.create(notificationData);

  res.status(201).json({
    success: true,
    message: 'Notification created successfully',
    data: { notification }
  });
}));

// @desc    Update notification
// @route   PUT /api/notifications/:id
// @access  Private (Admin only)
router.put('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { title, message, type, priority, channels, scheduledFor, expiresAt, isActive } = req.body;
  const notificationId = req.params.id;

  const updateData = {};
  if (title) updateData.title = title;
  if (message) updateData.message = message;
  if (type) updateData.type = type;
  if (priority) updateData.priority = priority;
  if (channels) updateData.channels = channels;
  if (scheduledFor) updateData.scheduledFor = scheduledFor;
  if (expiresAt) updateData.expiresAt = expiresAt;
  if (isActive !== undefined) updateData.isActive = isActive;

  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    updateData,
    { new: true, runValidators: true }
  ).populate('recipients createdBy');

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification updated successfully',
    data: { notification }
  });
}));

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private (Admin only)
router.delete('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Don't actually delete, just deactivate
  notification.isActive = false;
  await notification.save();

  res.json({
    success: true,
    message: 'Notification deactivated successfully'
  });
}));

// @desc    Send notification
// @route   POST /api/notifications/:id/send
// @access  Private (Admin only)
router.post('/:id/send', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  if (notification.status === 'sent') {
    return res.status(400).json({
      success: false,
      message: 'Notification already sent'
    });
  }

  // Send notification
  await notification.send();

  // Emit notification via Socket.IO
  req.io.emit('newNotification', {
    notification: {
      id: notification._id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      createdAt: notification.createdAt
    },
    recipients: notification.recipients
  });

  res.json({
    success: true,
    message: 'Notification sent successfully',
    data: { notification }
  });
}));

// @desc    Record user interaction
// @route   POST /api/notifications/:id/interact
// @access  Private
router.post('/:id/interact', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const { action, metadata = {} } = req.body;
  const notificationId = req.params.id;
  const userId = req.user._id;

  if (!action) {
    return res.status(400).json({
      success: false,
      message: 'Action is required'
    });
  }

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user is a recipient
  const isRecipient = notification.recipients.some(
    recipient => recipient.toString() === userId.toString()
  );

  if (!isRecipient) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Record interaction
  await notification.recordInteraction(userId, action, metadata);

  res.json({
    success: true,
    message: 'Interaction recorded successfully'
  });
}));

// @desc    Get notification statistics
// @route   GET /api/notifications/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', authorize('admin'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const matchStage = {
    createdAt: {
      $gte: startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      $lte: endDate ? new Date(endDate) : new Date()
    }
  };

  const stats = await Notification.getStats(
    startDate ? new Date(startDate) : null,
    endDate ? new Date(endDate) : null
  );

  res.json({
    success: true,
    data: stats[0] || {
      totalNotifications: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalRead: 0,
      totalFailed: 0,
      averageDeliveryRate: 0,
      averageReadRate: 0
    }
  });
}));

// @desc    Get notifications by role
// @route   GET /api/notifications/role/:role
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

  const notifications = await Notification.findByRole(role, {
    isActive: true
  })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({
    targetRoles: role,
    isActive: true
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get scheduled notifications
// @route   GET /api/notifications/scheduled
// @access  Private (Admin only)
router.get('/scheduled', authorize('admin'), asyncHandler(async (req, res) => {
  const notifications = await Notification.findScheduled()
    .populate('createdBy', 'firstName lastName')
    .populate('recipients', 'firstName lastName email');

  res.json({
    success: true,
    data: { notifications }
  });
}));

// @desc    Get expired notifications
// @route   GET /api/notifications/expired
// @access  Private (Admin only)
router.get('/expired', authorize('admin'), asyncHandler(async (req, res) => {
  const notifications = await Notification.findExpired()
    .populate('createdBy', 'firstName lastName')
    .populate('recipients', 'firstName lastName email');

  res.json({
    success: true,
    data: { notifications }
  });
}));

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put('/:id/read', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const notificationId = req.params.id;
  const userId = req.user._id;

  const notification = await Notification.findById(notificationId);
  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  // Check if user is a recipient
  const isRecipient = notification.recipients.some(
    recipient => recipient.toString() === userId.toString()
  );

  if (!isRecipient) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  // Record read interaction
  await notification.recordInteraction(userId, 'read');

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
}));

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put('/read-all', authenticateToken, asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all unread notifications for user
  const notifications = await Notification.find({
    recipients: userId,
    isActive: true
  });

  // Mark all as read
  for (const notification of notifications) {
    await notification.recordInteraction(userId, 'read');
  }

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

module.exports = router;
