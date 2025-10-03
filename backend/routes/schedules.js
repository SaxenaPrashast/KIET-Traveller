const express = require('express');
const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize, canAccessResource } = require('../middleware/auth');
const { validateSchedule, validateObjectId, validatePagination, validateDateRange } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all schedules
// @route   GET /api/schedules
// @access  Private
router.get('/', validatePagination, validateDateRange, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'date';
  const order = req.query.order || 'desc';
  const status = req.query.status;
  const routeId = req.query.route;
  const busId = req.query.bus;
  const driverId = req.query.driver;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  // Build query
  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (routeId) {
    query.route = routeId;
  }
  
  if (busId) {
    query.bus = busId;
  }
  
  if (driverId) {
    query.driver = driverId;
  }
  
  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const schedules = await Schedule.find(query)
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName email')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Schedule.countDocuments(query);

  res.json({
    success: true,
    data: {
      schedules,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get schedule by ID
// @route   GET /api/schedules/:id
// @access  Private
router.get('/:id', validateObjectId(), canAccessResource('schedule'), asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('route', 'routeNumber name stops')
    .populate('bus', 'busNumber registrationNumber capacity')
    .populate('driver', 'firstName lastName email phone');
  
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.json({
    success: true,
    data: { schedule }
  });
}));

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private (Admin only)
router.post('/', authorize('admin'), validateSchedule, asyncHandler(async (req, res) => {
  const scheduleData = req.body;
  scheduleData.createdBy = req.user._id;

  // Validate that route, bus, and driver exist
  const route = await Route.findById(scheduleData.route);
  if (!route) {
    return res.status(400).json({
      success: false,
      message: 'Route not found'
    });
  }

  const bus = await Bus.findById(scheduleData.bus);
  if (!bus) {
    return res.status(400).json({
      success: false,
      message: 'Bus not found'
    });
  }

  const driver = await User.findById(scheduleData.driver);
  if (!driver || driver.role !== 'driver') {
    return res.status(400).json({
      success: false,
      message: 'Invalid driver'
    });
  }

  // Check for conflicts
  const conflictingSchedule = await Schedule.findOne({
    $or: [
      { bus: scheduleData.bus, date: scheduleData.date, status: { $in: ['scheduled', 'in_progress'] } },
      { driver: scheduleData.driver, date: scheduleData.date, status: { $in: ['scheduled', 'in_progress'] } }
    ]
  });

  if (conflictingSchedule) {
    return res.status(400).json({
      success: false,
      message: 'Schedule conflict: Bus or driver already has a schedule for this date'
    });
  }

  const schedule = await Schedule.create(scheduleData);

  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: { schedule }
  });
}));

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Admin only)
router.put('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { route, bus, driver, date, startTime, endTime, tripType, notes } = req.body;
  const scheduleId = req.params.id;

  const updateData = {
    lastModifiedBy: req.user._id
  };
  
  if (route) updateData.route = route;
  if (bus) updateData.bus = bus;
  if (driver) updateData.driver = driver;
  if (date) updateData.date = date;
  if (startTime) updateData.startTime = startTime;
  if (endTime) updateData.endTime = endTime;
  if (tripType) updateData.tripType = tripType;
  if (notes) updateData.notes = notes;

  const schedule = await Schedule.findByIdAndUpdate(
    scheduleId,
    updateData,
    { new: true, runValidators: true }
  ).populate('route bus driver');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  res.json({
    success: true,
    message: 'Schedule updated successfully',
    data: { schedule }
  });
}));

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin only)
router.delete('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);
  
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Don't allow deletion of in-progress schedules
  if (schedule.status === 'in_progress') {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete schedule that is in progress'
    });
  }

  await Schedule.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Schedule deleted successfully'
  });
}));

// @desc    Start trip
// @route   PUT /api/schedules/:id/start
// @access  Private (Driver only)
router.put('/:id/start', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const scheduleId = req.params.id;
  const driver = req.user;

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if driver is assigned to this schedule
  if (schedule.driver.toString() !== driver._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this schedule'
    });
  }

  // Check if schedule is in scheduled status
  if (schedule.status !== 'scheduled') {
    return res.status(400).json({
      success: false,
      message: 'Schedule is not in scheduled status'
    });
  }

  // Start trip
  await schedule.startTrip();

  // Update bus status
  const bus = await Bus.findById(schedule.bus);
  if (bus) {
    bus.currentStatus = 'in_transit';
    bus.currentRoute = schedule.route;
    await bus.save();
  }

  // Emit trip start via Socket.IO
  req.io.emit('tripStarted', {
    scheduleId: schedule._id,
    route: schedule.route,
    bus: schedule.bus,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Trip started successfully',
    data: { schedule }
  });
}));

// @desc    Complete trip
// @route   PUT /api/schedules/:id/complete
// @access  Private (Driver only)
router.put('/:id/complete', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const scheduleId = req.params.id;
  const driver = req.user;

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if driver is assigned to this schedule
  if (schedule.driver.toString() !== driver._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this schedule'
    });
  }

  // Check if schedule is in progress
  if (schedule.status !== 'in_progress') {
    return res.status(400).json({
      success: false,
      message: 'Schedule is not in progress'
    });
  }

  // Complete trip
  await schedule.completeTrip();

  // Update bus status
  const bus = await Bus.findById(schedule.bus);
  if (bus) {
    bus.currentStatus = 'idle';
    bus.currentRoute = null;
    await bus.save();
  }

  // Emit trip completion via Socket.IO
  req.io.emit('tripCompleted', {
    scheduleId: schedule._id,
    route: schedule.route,
    bus: schedule.bus,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    duration: schedule.actualDuration,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Trip completed successfully',
    data: { schedule }
  });
}));

// @desc    Cancel trip
// @route   PUT /api/schedules/:id/cancel
// @access  Private (Driver only)
router.put('/:id/cancel', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const scheduleId = req.params.id;
  const driver = req.user;

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if driver is assigned to this schedule
  if (schedule.driver.toString() !== driver._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this schedule'
    });
  }

  // Cancel trip
  await schedule.cancelTrip(reason);

  // Update bus status
  const bus = await Bus.findById(schedule.bus);
  if (bus) {
    bus.currentStatus = 'idle';
    bus.currentRoute = null;
    await bus.save();
  }

  // Emit trip cancellation via Socket.IO
  req.io.emit('tripCancelled', {
    scheduleId: schedule._id,
    route: schedule.route,
    bus: schedule.bus,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    reason,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Trip cancelled successfully',
    data: { schedule }
  });
}));

// @desc    Update delay
// @route   PUT /api/schedules/:id/delay
// @access  Private (Driver only)
router.put('/:id/delay', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const { delayMinutes, reason } = req.body;
  const scheduleId = req.params.id;
  const driver = req.user;

  if (!delayMinutes || delayMinutes < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid delay minutes is required'
    });
  }

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if driver is assigned to this schedule
  if (schedule.driver.toString() !== driver._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this schedule'
    });
  }

  // Update delay
  await schedule.updateDelay(delayMinutes, reason);

  // Emit delay update via Socket.IO
  req.io.emit('tripDelayed', {
    scheduleId: schedule._id,
    route: schedule.route,
    bus: schedule.bus,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    delayMinutes,
    reason,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Delay updated successfully',
    data: { schedule }
  });
}));

// @desc    Update occupancy
// @route   PUT /api/schedules/:id/occupancy
// @access  Private (Driver only)
router.put('/:id/occupancy', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const { occupancy } = req.body;
  const scheduleId = req.params.id;
  const driver = req.user;

  if (occupancy === undefined || occupancy < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid occupancy value is required'
    });
  }

  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if driver is assigned to this schedule
  if (schedule.driver.toString() !== driver._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this schedule'
    });
  }

  // Update occupancy
  await schedule.updateOccupancy(occupancy);

  res.json({
    success: true,
    message: 'Occupancy updated successfully',
    data: { schedule }
  });
}));

// @desc    Get today's schedules
// @route   GET /api/schedules/today
// @access  Private
router.get('/today', asyncHandler(async (req, res) => {
  const schedules = await Schedule.findToday()
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName');

  res.json({
    success: true,
    data: { schedules }
  });
}));

// @desc    Get active schedules
// @route   GET /api/schedules/active
// @access  Private
router.get('/active', asyncHandler(async (req, res) => {
  const schedules = await Schedule.findActive()
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName');

  res.json({
    success: true,
    data: { schedules }
  });
}));

// @desc    Get schedules by route
// @route   GET /api/schedules/route/:routeId
// @access  Private
router.get('/route/:routeId', validateObjectId(), asyncHandler(async (req, res) => {
  const { routeId } = req.params;
  const { date } = req.query;

  const schedules = await Schedule.findByRoute(routeId, date ? new Date(date) : null)
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName');

  res.json({
    success: true,
    data: { schedules }
  });
}));

// @desc    Get schedules by driver
// @route   GET /api/schedules/driver/:driverId
// @access  Private
router.get('/driver/:driverId', validateObjectId(), asyncHandler(async (req, res) => {
  const { driverId } = req.params;
  const { date } = req.query;

  const schedules = await Schedule.findByDriver(driverId, date ? new Date(date) : null)
    .populate('route', 'routeNumber name')
    .populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName');

  res.json({
    success: true,
    data: { schedules }
  });
}));

// @desc    Get schedule statistics
// @route   GET /api/schedules/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Schedule.aggregate([
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
        averageOccupancy: { $avg: '$averageOccupancy' },
        totalPassengers: { $sum: '$totalPassengers' },
        averageDuration: { $avg: '$actualDuration' }
      }
    },
    {
      $project: {
        _id: 0,
        totalSchedules: 1,
        completedSchedules: 1,
        inProgressSchedules: 1,
        cancelledSchedules: 1,
        delayedSchedules: 1,
        scheduledSchedules: { $subtract: ['$totalSchedules', { $add: ['$completedSchedules', '$inProgressSchedules', '$cancelledSchedules', '$delayedSchedules'] }] },
        averageDelay: { $round: ['$averageDelay', 2] },
        averageOccupancy: { $round: ['$averageOccupancy', 2] },
        totalPassengers: 1,
        averageDuration: { $round: ['$averageDuration', 2] },
        completionRate: {
          $round: [
            { $multiply: [{ $divide: ['$completedSchedules', '$totalSchedules'] }, 100] },
            2
          ]
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalSchedules: 0,
      completedSchedules: 0,
      inProgressSchedules: 0,
      cancelledSchedules: 0,
      delayedSchedules: 0,
      scheduledSchedules: 0,
      averageDelay: 0,
      averageOccupancy: 0,
      totalPassengers: 0,
      averageDuration: 0,
      completionRate: 0
    }
  });
}));

module.exports = router;
