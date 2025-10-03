const express = require('express');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize, canAccessResource } = require('../middleware/auth');
const { validateBus, validateObjectId, validatePagination, validateLocation } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all buses
// @route   GET /api/buses
// @access  Private
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'createdAt';
  const order = req.query.order || 'desc';
  const status = req.query.status;
  const search = req.query.q;

  // Build query
  let query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$or = [
      { busNumber: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { manufacturer: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const buses = await Bus.find(query)
    .populate('currentRoute', 'routeNumber name')
    .populate('assignedDriver', 'firstName lastName email')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const total = await Bus.countDocuments(query);

  res.json({
    success: true,
    data: {
      buses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get bus by ID
// @route   GET /api/buses/:id
// @access  Private
router.get('/:id', validateObjectId(), canAccessResource('bus'), asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id)
    .populate('currentRoute', 'routeNumber name stops')
    .populate('assignedDriver', 'firstName lastName email phone');
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.json({
    success: true,
    data: { bus }
  });
}));

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private (Admin only)
router.post('/', authorize('admin'), validateBus, asyncHandler(async (req, res) => {
  const busData = req.body;
  busData.createdBy = req.user._id;

  const bus = await Bus.create(busData);

  res.status(201).json({
    success: true,
    message: 'Bus created successfully',
    data: { bus }
  });
}));

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private (Admin only)
router.put('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { busNumber, registrationNumber, model, manufacturer, year, capacity, features, status, fuelType, insuranceExpiry, permitExpiry } = req.body;
  const busId = req.params.id;

  const updateData = {};
  if (busNumber) updateData.busNumber = busNumber;
  if (registrationNumber) updateData.registrationNumber = registrationNumber;
  if (model) updateData.model = model;
  if (manufacturer) updateData.manufacturer = manufacturer;
  if (year) updateData.year = year;
  if (capacity) updateData.capacity = capacity;
  if (features) updateData.features = features;
  if (status) updateData.status = status;
  if (fuelType) updateData.fuelType = fuelType;
  if (insuranceExpiry) updateData.insuranceExpiry = insuranceExpiry;
  if (permitExpiry) updateData.permitExpiry = permitExpiry;

  const bus = await Bus.findByIdAndUpdate(
    busId,
    updateData,
    { new: true, runValidators: true }
  ).populate('currentRoute assignedDriver');

  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  res.json({
    success: true,
    message: 'Bus updated successfully',
    data: { bus }
  });
}));

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private (Admin only)
router.delete('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Don't actually delete, just mark as retired
  bus.status = 'retired';
  await bus.save();

  res.json({
    success: true,
    message: 'Bus retired successfully'
  });
}));

// @desc    Assign driver to bus
// @route   PUT /api/buses/:id/assign-driver
// @access  Private (Admin only)
router.put('/:id/assign-driver', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { driverId } = req.body;
  const busId = req.params.id;

  if (!driverId) {
    return res.status(400).json({
      success: false,
      message: 'Driver ID is required'
    });
  }

  const driver = await User.findById(driverId);
  if (!driver || driver.role !== 'driver') {
    return res.status(400).json({
      success: false,
      message: 'Invalid driver'
    });
  }

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Remove driver from previous bus if any
  if (driver.assignedBus) {
    await Bus.findByIdAndUpdate(driver.assignedBus, { assignedDriver: null });
  }

  // Assign driver to new bus
  bus.assignedDriver = driverId;
  await bus.save();

  // Update driver's assigned bus
  driver.assignedBus = busId;
  await driver.save();

  res.json({
    success: true,
    message: 'Driver assigned successfully',
    data: { bus }
  });
}));

// @desc    Update bus location
// @route   PUT /api/buses/:id/location
// @access  Private (Driver only)
router.put('/:id/location', validateObjectId(), validateLocation, authorize('driver'), asyncHandler(async (req, res) => {
  const { latitude, longitude, speed, occupancy } = req.body;
  const busId = req.params.id;
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

  // Update speed and occupancy if provided
  if (speed !== undefined) {
    bus.currentSpeed = speed;
  }
  
  if (occupancy !== undefined) {
    await bus.updateOccupancy(occupancy);
  }

  await bus.save();

  // Emit location update via Socket.IO
  req.io.emit('busLocationUpdate', {
    busId: bus._id,
    busNumber: bus.busNumber,
    location: bus.currentLocation,
    speed: bus.currentSpeed,
    occupancy: bus.currentOccupancy,
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Location updated successfully',
    data: { bus }
  });
}));

// @desc    Start route
// @route   PUT /api/buses/:id/start-route
// @access  Private (Driver only)
router.put('/:id/start-route', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const { routeId } = req.body;
  const busId = req.params.id;
  const driver = req.user;

  if (!routeId) {
    return res.status(400).json({
      success: false,
      message: 'Route ID is required'
    });
  }

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

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Start route
  await bus.startRoute(routeId);
  bus.currentStatus = 'in_transit';
  await bus.save();

  // Emit route start via Socket.IO
  req.io.emit('routeStarted', {
    busId: bus._id,
    busNumber: bus.busNumber,
    routeId: route._id,
    routeNumber: route.routeNumber,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Route started successfully',
    data: { bus }
  });
}));

// @desc    End route
// @route   PUT /api/buses/:id/end-route
// @access  Private (Driver only)
router.put('/:id/end-route', validateObjectId(), authorize('driver'), asyncHandler(async (req, res) => {
  const busId = req.params.id;
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

  // End route
  await bus.endRoute();

  // Emit route end via Socket.IO
  req.io.emit('routeEnded', {
    busId: bus._id,
    busNumber: bus.busNumber,
    driver: {
      id: driver._id,
      name: driver.fullName
    },
    timestamp: new Date()
  });

  res.json({
    success: true,
    message: 'Route ended successfully',
    data: { bus }
  });
}));

// @desc    Get nearby buses
// @route   GET /api/buses/nearby
// @access  Private
router.get('/nearby', validateLocation, asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 1000 } = req.query;

  const buses = await Bus.findNearby(
    parseFloat(longitude),
    parseFloat(latitude),
    parseInt(maxDistance)
  ).populate('currentRoute assignedDriver');

  res.json({
    success: true,
    data: { buses }
  });
}));

// @desc    Get active buses
// @route   GET /api/buses/active
// @access  Private
router.get('/active', asyncHandler(async (req, res) => {
  const buses = await Bus.findActive()
    .populate('currentRoute', 'routeNumber name')
    .populate('assignedDriver', 'firstName lastName');

  res.json({
    success: true,
    data: { buses }
  });
}));

// @desc    Get bus statistics
// @route   GET /api/buses/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Bus.aggregate([
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
        totalCapacity: { $sum: '$capacity' },
        statusCounts: {
          $push: {
            status: '$status',
            currentStatus: '$currentStatus'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalBuses: 1,
        activeBuses: 1,
        inTransitBuses: 1,
        maintenanceBuses: 1,
        idleBuses: { $subtract: ['$activeBuses', '$inTransitBuses'] },
        averageOccupancy: { $round: ['$averageOccupancy', 2] },
        totalCapacity: 1,
        utilizationRate: {
          $round: [
            { $multiply: [{ $divide: ['$averageOccupancy', '$totalCapacity'] }, 100] },
            2
          ]
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalBuses: 0,
      activeBuses: 0,
      inTransitBuses: 0,
      maintenanceBuses: 0,
      idleBuses: 0,
      averageOccupancy: 0,
      totalCapacity: 0,
      utilizationRate: 0
    }
  });
}));

module.exports = router;
