const express = require('express');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateLocation, validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

// @desc    Get live bus locations
// @route   GET /api/tracking/live
// @access  Private
router.get('/live', authenticateToken, asyncHandler(async (req, res) => {
  const { routeId, busId } = req.query;

  let query = {
    status: 'active',
    isTrackingEnabled: true,
    currentLocation: { $exists: true }
  };

  if (routeId) {
    query.currentRoute = routeId;
  }

  if (busId) {
    query._id = busId;
  }

  const buses = await Bus.find(query)
    .populate('currentRoute', 'routeNumber name stops')
    .populate('assignedDriver', 'firstName lastName')
    .select('busNumber currentLocation currentStatus currentSpeed currentOccupancy capacity lastLocationUpdate currentRoute assignedDriver');

  res.json({
    success: true,
    data: { buses },
    timestamp: new Date()
  });
}));

// @desc    Get bus location history
// @route   GET /api/tracking/:busId/history
// @access  Private
router.get('/:busId/history', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const { startDate, endDate, limit = 100 } = req.query;

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // In a real application, you would store location history in a separate collection
  // For now, we'll return the current location
  const history = [{
    location: bus.currentLocation,
    timestamp: bus.lastLocationUpdate,
    speed: bus.currentSpeed,
    occupancy: bus.currentOccupancy
  }];

  res.json({
    success: true,
    data: { history }
  });
}));

// @desc    Get nearby buses
// @route   GET /api/tracking/nearby
// @access  Private
router.get('/nearby', validateLocation, authenticateToken, asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 1000 } = req.query;

  const buses = await Bus.findNearby(
    parseFloat(longitude),
    parseFloat(latitude),
    parseInt(maxDistance)
  ).populate('currentRoute', 'routeNumber name')
   .populate('assignedDriver', 'firstName lastName');

  res.json({
    success: true,
    data: { buses }
  });
}));

// @desc    Get route progress
// @route   GET /api/tracking/route/:routeId/progress
// @access  Private
router.get('/route/:routeId/progress', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const { routeId } = req.params;

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Get buses currently on this route
  const buses = await Bus.find({
    currentRoute: routeId,
    status: 'active',
    currentStatus: 'in_transit'
  }).populate('assignedDriver', 'firstName lastName');

  // Get current schedules for this route
  const schedules = await Schedule.find({
    route: routeId,
    status: { $in: ['scheduled', 'in_progress'] },
    date: { $gte: new Date() }
  }).populate('bus', 'busNumber registrationNumber')
    .populate('driver', 'firstName lastName');

  res.json({
    success: true,
    data: {
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        name: route.name,
        stops: route.stops
      },
      activeBuses: buses,
      schedules
    }
  });
}));

// @desc    Get bus status
// @route   GET /api/tracking/bus/:busId/status
// @access  Private
router.get('/bus/:busId/status', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const { busId } = req.params;

  const bus = await Bus.findById(busId)
    .populate('currentRoute', 'routeNumber name stops')
    .populate('assignedDriver', 'firstName lastName email phone');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Get current schedule if bus is on a route
  let currentSchedule = null;
  if (bus.currentRoute) {
    currentSchedule = await Schedule.findOne({
      bus: busId,
      route: bus.currentRoute._id,
      status: 'in_progress',
      date: { $gte: new Date() }
    }).populate('route', 'routeNumber name');
  }

  res.json({
    success: true,
    data: {
      bus: {
        id: bus._id,
        busNumber: bus.busNumber,
        registrationNumber: bus.registrationNumber,
        currentLocation: bus.currentLocation,
        currentStatus: bus.currentStatus,
        currentSpeed: bus.currentSpeed,
        currentOccupancy: bus.currentOccupancy,
        capacity: bus.capacity,
        occupancyPercentage: bus.occupancyPercentage,
        lastLocationUpdate: bus.lastLocationUpdate,
        currentRoute: bus.currentRoute,
        assignedDriver: bus.assignedDriver
      },
      currentSchedule
    }
  });
}));

// @desc    Update bus location (for drivers)
// @route   PUT /api/tracking/bus/:busId/location
// @access  Private (Driver only)
router.put('/bus/:busId/location', validateObjectId(), validateLocation, authorize('driver'), asyncHandler(async (req, res) => {
  const { busId } = req.params;
  const { latitude, longitude, speed, occupancy, heading } = req.body;
  const driver = req.user;

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Check if driver is assigned to this bus
  if (driver.assignedBus && driver.assignedBus.toString() !== busId) {
    return res.status(403).json({
      success: false,
      message: 'You are not assigned to this bus'
    });
  }

  // Update location
  await bus.updateLocation(latitude, longitude);

  // Update other tracking data
  if (speed !== undefined) {
    bus.currentSpeed = speed;
  }
  
  if (occupancy !== undefined) {
    await bus.updateOccupancy(occupancy);
  }

  if (heading !== undefined) {
    bus.heading = heading;
  }

  bus.lastLocationUpdate = new Date();
  await bus.save();

  // Emit location update via Socket.IO
  req.io.emit('busLocationUpdate', {
    busId: bus._id,
    busNumber: bus.busNumber,
    location: bus.currentLocation,
    speed: bus.currentSpeed,
    occupancy: bus.currentOccupancy,
    heading: bus.heading,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: {
      bus: {
        id: bus._id,
        busNumber: bus.busNumber,
        currentLocation: bus.currentLocation,
        currentSpeed: bus.currentSpeed,
        currentOccupancy: bus.currentOccupancy,
        lastLocationUpdate: bus.lastLocationUpdate
      }
    }
  });
}));

// @desc    Get tracking statistics
// @route   GET /api/tracking/stats
// @access  Private (Admin only)
router.get('/stats', authorize('admin'), asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  const stats = await Bus.aggregate([
    {
      $match: {
        status: 'active',
        isTrackingEnabled: true,
        ...(Object.keys(dateFilter).length > 0 && { lastLocationUpdate: dateFilter })
      }
    },
    {
      $group: {
        _id: null,
        totalTrackedBuses: { $sum: 1 },
        activeBuses: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'in_transit'] }, 1, 0] }
        },
        idleBuses: {
          $sum: { $cond: [{ $eq: ['$currentStatus', 'idle'] }, 1, 0] }
        },
        averageSpeed: { $avg: '$currentSpeed' },
        averageOccupancy: { $avg: '$currentOccupancy' },
        totalCapacity: { $sum: '$capacity' },
        lastUpdateTimes: { $push: '$lastLocationUpdate' }
      }
    },
    {
      $project: {
        _id: 0,
        totalTrackedBuses: 1,
        activeBuses: 1,
        idleBuses: 1,
        averageSpeed: { $round: ['$averageSpeed', 2] },
        averageOccupancy: { $round: ['$averageOccupancy', 2] },
        totalCapacity: 1,
        utilizationRate: {
          $round: [
            { $multiply: [{ $divide: ['$averageOccupancy', '$totalCapacity'] }, 100] },
            2
          ]
        },
        lastUpdate: { $max: '$lastUpdateTimes' }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalTrackedBuses: 0,
      activeBuses: 0,
      idleBuses: 0,
      averageSpeed: 0,
      averageOccupancy: 0,
      totalCapacity: 0,
      utilizationRate: 0,
      lastUpdate: null
    }
  });
}));

// @desc    Get real-time alerts
// @route   GET /api/tracking/alerts
// @access  Private
router.get('/alerts', authenticateToken, asyncHandler(async (req, res) => {
  const alerts = [];

  // Check for buses with no recent location updates
  const staleBuses = await Bus.find({
    status: 'active',
    isTrackingEnabled: true,
    lastLocationUpdate: {
      $lt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
    }
  }).populate('assignedDriver', 'firstName lastName');

  staleBuses.forEach(bus => {
    alerts.push({
      type: 'stale_location',
      severity: 'warning',
      message: `Bus ${bus.busNumber} has not updated location in over 10 minutes`,
      busId: bus._id,
      busNumber: bus.busNumber,
      driver: bus.assignedDriver,
      timestamp: new Date()
    });
  });

  // Check for buses with high occupancy
  const crowdedBuses = await Bus.find({
    status: 'active',
    currentStatus: 'in_transit',
    $expr: {
      $gte: [
        { $divide: ['$currentOccupancy', '$capacity'] },
        0.9
      ]
    }
  }).populate('assignedDriver', 'firstName lastName');

  crowdedBuses.forEach(bus => {
    alerts.push({
      type: 'high_occupancy',
      severity: 'info',
      message: `Bus ${bus.busNumber} is at ${Math.round((bus.currentOccupancy / bus.capacity) * 100)}% capacity`,
      busId: bus._id,
      busNumber: bus.busNumber,
      driver: bus.assignedDriver,
      occupancy: bus.currentOccupancy,
      capacity: bus.capacity,
      timestamp: new Date()
    });
  });

  // Check for buses with maintenance issues
  const maintenanceBuses = await Bus.find({
    status: 'maintenance'
  }).populate('assignedDriver', 'firstName lastName');

  maintenanceBuses.forEach(bus => {
    alerts.push({
      type: 'maintenance',
      severity: 'warning',
      message: `Bus ${bus.busNumber} is under maintenance`,
      busId: bus._id,
      busNumber: bus.busNumber,
      driver: bus.assignedDriver,
      timestamp: new Date()
    });
  });

  res.json({
    success: true,
    data: { alerts }
  });
}));

// @desc    Get route ETA
// @route   GET /api/tracking/route/:routeId/eta
// @access  Private
router.get('/route/:routeId/eta', validateObjectId(), authenticateToken, asyncHandler(async (req, res) => {
  const { routeId } = req.params;
  const { stopId } = req.query;

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Get buses currently on this route
  const buses = await Bus.find({
    currentRoute: routeId,
    status: 'active',
    currentStatus: 'in_transit'
  }).populate('assignedDriver', 'firstName lastName');

  const etaData = buses.map(bus => {
    // Calculate ETA for each stop
    const stopETAs = route.stops.map((stop, index) => {
      const currentStopIndex = bus.currentStopIndex || 0;
      const stopsRemaining = index - currentStopIndex;
      const estimatedTimePerStop = 5; // minutes
      const eta = stopsRemaining * estimatedTimePerStop;
      
      return {
        stopId: stop._id,
        stopName: stop.name,
        sequence: stop.sequence,
        eta: Math.max(0, eta)
      };
    });

    return {
      busId: bus._id,
      busNumber: bus.busNumber,
      currentLocation: bus.currentLocation,
      currentStopIndex: bus.currentStopIndex,
      stopETAs
    };
  });

  res.json({
    success: true,
    data: {
      route: {
        id: route._id,
        routeNumber: route.routeNumber,
        name: route.name
      },
      buses: etaData
    }
  });
}));

module.exports = router;
