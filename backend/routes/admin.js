const express = require('express');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize } = require('../middleware/auth');
const { validateObjectId, validatePagination, validateDateRange } = require('../middleware/validation');

const router = express.Router();

// All routes require admin access
router.use(authorize('admin'));

// @desc    Get dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
router.get('/dashboard', asyncHandler(async (req, res) => {
  // Get user statistics
  const userStats = await User.aggregate([
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
    }
  ]);

  // Get bus statistics
  const busStats = await Bus.aggregate([
    {
      $group: {
        _id: null,
        totalBuses: { $sum: 1 },
        activeBuses: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inTransitBuses: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'in_transit'] }, 1, 0] }
        },
        maintenanceBuses: {
          $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] }
        },
        averageOccupancy: { $avg: '$currentOccupancy' },
        totalCapacity: { $sum: '$capacity' }
      }
    }
  ]);

  // Get route statistics
  const routeStats = await Route.aggregate([
    {
      $group: {
        _id: null,
        totalRoutes: { $sum: 1 },
        activeRoutes: {
          $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
        },
        popularRoutes: {
          $sum: { $cond: [{ $eq: ['$isPopular', true] }, 1, 0] }
        },
        totalTrips: { $sum: '$totalTrips' },
        averageRating: { $avg: '$averageRating' }
      }
    }
  ]);

  // Get schedule statistics
  const scheduleStats = await Schedule.aggregate([
    {
      $group: {
        _id: null,
        totalSchedules: { $sum: 1 },
        completedSchedules: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        inProgressSchedules: {
          $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
        },
        cancelledSchedules: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        delayedSchedules: {
          $sum: { $cond: [{ $eq: ['$status', 'delayed'] }, 1, 0] }
        },
        averageDelay: { $avg: '$delayMinutes' },
        totalPassengers: { $sum: '$totalPassengers' }
      }
    }
  ]);

  // Get notification statistics
  const notificationStats = await Notification.getStats();

  // Get feedback statistics
  const feedbackStats = await Feedback.getStats();

  // Get recent activities (simplified)
  const recentSchedules = await Schedule.find()
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber')
    .populate('driver', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentNotifications = await Notification.find()
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(5);

  const recentFeedback = await Feedback.find()
    .populate('user', 'firstName lastName')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      overview: {
        users: userStats[0] || {
          totalUsers: 0,
          activeUsers: 0,
          verifiedUsers: 0,
          inactiveUsers: 0,
          unverifiedUsers: 0
        },
        buses: busStats[0] || {
          totalBuses: 0,
          activeBuses: 0,
          inTransitBuses: 0,
          maintenanceBuses: 0,
          averageOccupancy: 0,
          totalCapacity: 0
        },
        routes: routeStats[0] || {
          totalRoutes: 0,
          activeRoutes: 0,
          popularRoutes: 0,
          totalTrips: 0,
          averageRating: 0
        },
        schedules: scheduleStats[0] || {
          totalSchedules: 0,
          completedSchedules: 0,
          inProgressSchedules: 0,
          cancelledSchedules: 0,
          delayedSchedules: 0,
          averageDelay: 0,
          totalPassengers: 0
        },
        notifications: notificationStats[0] || {
          totalNotifications: 0,
          totalSent: 0,
          totalDelivered: 0,
          totalRead: 0,
          totalFailed: 0
        },
        feedback: feedbackStats[0] || {
          totalFeedback: 0,
          averageRating: 0,
          totalViews: 0,
          totalLikes: 0,
          totalDislikes: 0
        }
      },
      recentActivities: {
        schedules: recentSchedules,
        notifications: recentNotifications,
        feedback: recentFeedback
      }
    }
  });
}));

// @desc    Get system metrics
// @route   GET /api/admin/metrics
// @access  Private (Admin only)
router.get('/metrics', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Get daily user registrations
  const dailyRegistrations = await User.aggregate([
    {
      $match: {
        createdAt: dateFilter
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Get daily bus trips
  const dailyTrips = await Schedule.aggregate([
    {
      $match: {
        status: 'completed',
        actualEndTime: dateFilter
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$actualEndTime' },
          month: { $month: '$actualEndTime' },
          day: { $dayOfMonth: '$actualEndTime' }
        },
        count: { $sum: 1 },
        totalPassengers: { $sum: '$totalPassengers' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
    }
  ]);

  // Get route popularity
  const routePopularity = await Schedule.aggregate([
    {
      $match: {
        status: 'completed',
        actualEndTime: dateFilter
      }
    },
    {
      $group: {
        _id: '$route',
        tripCount: { $sum: 1 },
        totalPassengers: { $sum: '$totalPassengers' },
        averageOccupancy: { $avg: '$averageOccupancy' }
      }
    },
    {
      $lookup: {
        from: 'routes',
        localField: '_id',
        foreignField: '_id',
        as: 'route'
      }
    },
    {
      $unwind: '$route'
    },
    {
      $project: {
        routeId: '$_id',
        routeNumber: '$route.routeNumber',
        routeName: '$route.name',
        tripCount: 1,
        totalPassengers: 1,
        averageOccupancy: { $round: ['$averageOccupancy', 2] }
      }
    },
    {
      $sort: { tripCount: -1 }
    },
    {
      $limit: 10
    }
  ]);

  // Get bus utilization
  const busUtilization = await Bus.aggregate([
    {
      $match: {
        status: 'active'
      }
    },
    {
      $lookup: {
        from: 'schedules',
        localField: '_id',
        foreignField: 'bus',
        as: 'schedules'
      }
    },
    {
      $project: {
        busNumber: 1,
        registrationNumber: 1,
        capacity: 1,
        currentOccupancy: 1,
        scheduleCount: { $size: '$schedules' },
        utilizationRate: {
          $round: [
            { $multiply: [{ $divide: ['$currentOccupancy', '$capacity'] }, 100] },
            2
          ]
        }
      }
    },
    {
      $sort: { utilizationRate: -1 }
    },
    {
      $limit: 10
    }
  ]);

  res.json({
    success: true,
    data: {
      dailyRegistrations,
      dailyTrips,
      routePopularity,
      busUtilization
    }
  });
}));

// @desc    Get user management data
// @route   GET /api/admin/users
// @access  Private (Admin only)
router.get('/users', validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const role = req.query.role;
  const status = req.query.status;
  const search = req.query.q;

  let query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (status) {
    query.isActive = status === 'active';
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

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
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

// @desc    Get feedback management data
// @route   GET /api/admin/feedback
// @access  Private (Admin only)
router.get('/feedback', validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const priority = req.query.priority;
  const type = req.query.type;

  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (priority) {
    query.priority = priority;
  }
  
  if (type) {
    query.type = type;
  }

  const feedback = await Feedback.find(query)
    .populate('user', 'firstName lastName email')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber')
    .populate('relatedDriver', 'firstName lastName')
    .populate('respondedBy', 'firstName lastName')
    .populate('resolvedBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Feedback.countDocuments(query);

  res.json({
    success: true,
    data: {
      feedback,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get pending feedback
// @route   GET /api/admin/feedback/pending
// @access  Private (Admin only)
router.get('/feedback/pending', asyncHandler(async (req, res) => {
  const feedback = await Feedback.findPending()
    .populate('user', 'firstName lastName email')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber');

  res.json({
    success: true,
    data: { feedback }
  });
}));

// @desc    Get high priority feedback
// @route   GET /api/admin/feedback/high-priority
// @access  Private (Admin only)
router.get('/feedback/high-priority', asyncHandler(async (req, res) => {
  const feedback = await Feedback.findHighPriority()
    .populate('user', 'firstName lastName email')
    .populate('relatedRoute', 'routeNumber name')
    .populate('relatedBus', 'busNumber');

  res.json({
    success: true,
    data: { feedback }
  });
}));

// @desc    Respond to feedback
// @route   PUT /api/admin/feedback/:id/respond
// @access  Private (Admin only)
router.put('/feedback/:id/respond', validateObjectId(), asyncHandler(async (req, res) => {
  const { message } = req.body;
  const feedbackId = req.params.id;
  const adminId = req.user._id;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Response message is required'
    });
  }

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }

  await feedback.respond(message, adminId);

  res.json({
    success: true,
    message: 'Response sent successfully',
    data: { feedback }
  });
}));

// @desc    Resolve feedback
// @route   PUT /api/admin/feedback/:id/resolve
// @access  Private (Admin only)
router.put('/feedback/:id/resolve', validateObjectId(), asyncHandler(async (req, res) => {
  const { description, actions = [] } = req.body;
  const feedbackId = req.params.id;
  const adminId = req.user._id;

  if (!description) {
    return res.status(400).json({
      success: false,
      message: 'Resolution description is required'
    });
  }

  const feedback = await Feedback.findById(feedbackId);
  if (!feedback) {
    return res.status(404).json({
      success: false,
      message: 'Feedback not found'
    });
  }

  await feedback.resolve(description, adminId, actions);

  res.json({
    success: true,
    message: 'Feedback resolved successfully',
    data: { feedback }
  });
}));

// @desc    Get system logs
// @route   GET /api/admin/logs
// @access  Private (Admin only)
router.get('/logs', asyncHandler(async (req, res) => {
  // In a real application, you would have a proper logging system
  // For now, we'll return a mock response
  const logs = [
    {
      id: 1,
      level: 'info',
      message: 'System started successfully',
      timestamp: new Date(),
      source: 'server'
    },
    {
      id: 2,
      level: 'warning',
      message: 'High memory usage detected',
      timestamp: new Date(Date.now() - 60000),
      source: 'monitor'
    },
    {
      id: 3,
      level: 'error',
      message: 'Database connection failed',
      timestamp: new Date(Date.now() - 120000),
      source: 'database'
    }
  ];

  res.json({
    success: true,
    data: { logs }
  });
}));

// @desc    Get system health
// @route   GET /api/admin/health
// @access  Private (Admin only)
router.get('/health', asyncHandler(async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
    environment: process.env.NODE_ENV,
    database: 'connected', // In real app, check actual DB connection
    services: {
      api: 'running',
      database: 'connected',
      socketio: 'running',
      notifications: 'running'
    }
  };

  res.json({
    success: true,
    data: { health }
  });
}));

// @desc    Export data
// @route   GET /api/admin/export/:type
// @access  Private (Admin only)
router.get('/export/:type', asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;

  let data = [];
  let filename = '';

  switch (type) {
    case 'users':
      data = await User.find().select('-password');
      filename = 'users.csv';
      break;
    case 'buses':
      data = await Bus.find();
      filename = 'buses.csv';
      break;
    case 'routes':
      data = await Route.find();
      filename = 'routes.csv';
      break;
    case 'schedules':
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      data = await Schedule.find({ date: dateFilter });
      filename = 'schedules.csv';
      break;
    case 'feedback':
      data = await Feedback.find();
      filename = 'feedback.csv';
      break;
    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid export type'
      });
  }

  // In a real application, you would convert to CSV and send as file
  res.json({
    success: true,
    message: 'Export completed',
    data: {
      type,
      count: data.length,
      filename
    }
  });
}));

module.exports = router;
