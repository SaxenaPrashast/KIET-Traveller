const express = require('express');
const Route = require('../models/Route');
const Bus = require('../models/Bus');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authorize, canAccessResource } = require('../middleware/auth');
const { validateRoute, validateObjectId, validatePagination, validateLocation } = require('../middleware/validation');

const router = express.Router();

// @desc    Get all routes
// @route   GET /api/routes
// @access  Private
router.get('/', validatePagination, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = req.query.sort || 'createdAt';
  const order = req.query.order || 'desc';
  const isActive = req.query.isActive;
  const search = req.query.q;

  // Build query
  let query = {};
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }
  
  if (search) {
    query.$or = [
      { routeNumber: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const routes = await Route.find(query)
    .populate('createdBy', 'firstName lastName')
    .populate('assignedBuses', 'busNumber registrationNumber')
    .sort(sortObj)
    .skip(skip)
    .limit(limit);

  const assignedBusIds = routes.flatMap(route =>
    (route.assignedBuses || []).map(bus => bus._id)
  );

  const studentAssignments = assignedBusIds.length > 0
    ? await User.aggregate([
        {
          $match: {
            role: 'student',
            isActive: true,
            assignedBus: { $in: assignedBusIds }
          }
        },
        {
          $group: {
            _id: '$assignedBus',
            count: { $sum: 1 }
          }
        }
      ])
    : [];

  const studentCountByBus = new Map(
    studentAssignments.map(item => [item._id.toString(), item.count])
  );

  const routesWithStudentCounts = routes.map(route => {
    const routeObject = route.toObject();
    routeObject.activeStudentsCount = (route.assignedBuses || []).reduce((total, bus) => {
      return total + (studentCountByBus.get(bus._id.toString()) || 0);
    }, 0);
    return routeObject;
  });

  const total = await Route.countDocuments(query);

  res.json({
    success: true,
    data: {
      routes: routesWithStudentCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
}));

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Private
router.get('/:id', validateObjectId(), canAccessResource('route'), asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id)
    .populate('createdBy', 'firstName lastName')
    .populate('assignedBuses', 'busNumber registrationNumber status')
    .populate('lastModifiedBy', 'firstName lastName');
  
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  res.json({
    success: true,
    data: { route }
  });
}));

// @desc    Create new route
// @route   POST /api/routes
// @access  Private (Admin only)
router.post('/', authorize('admin'), validateRoute, asyncHandler(async (req, res) => {
  const routeData = req.body;
  routeData.createdBy = req.user._id;

  const route = await Route.create(routeData);

  // Calculate distance
  await route.calculateDistance();

  // Ensure startStop and endStop are set to first and last stops when not provided
  try {
    let changed = false;
    if ((!route.startStop || !route.endStop) && route.stops && route.stops.length > 0) {
      if (!route.startStop) {
        route.startStop = route.stops[0]._id;
        changed = true;
      }
      if (!route.endStop && route.stops.length > 0) {
        route.endStop = route.stops[route.stops.length - 1]._id;
        changed = true;
      }
      if (changed) await route.save();
    }
  } catch (err) {
    // non-fatal: we already created the route; log and continue
    console.error('Failed to auto-set start/end stops:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Route created successfully',
    data: { route }
  });
}));

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private (Admin only)
router.put('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { name, description, stops, estimatedDuration, frequency, capacity, operatingHours, operatingDays, isActive } = req.body;
  const routeId = req.params.id;

  const updateData = {
    lastModifiedBy: req.user._id
  };
  
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (stops) updateData.stops = stops;
  if (estimatedDuration) updateData.estimatedDuration = estimatedDuration;
  if (frequency) updateData.frequency = frequency;
  if (capacity) updateData.capacity = capacity;
  if (operatingHours) updateData.operatingHours = operatingHours;
  if (operatingDays) updateData.operatingDays = operatingDays;
  if (isActive !== undefined) updateData.isActive = isActive;

  const route = await Route.findByIdAndUpdate(
    routeId,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy assignedBuses');

  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Recalculate distance if stops were updated
  if (stops) {
    await route.calculateDistance();
  }

  res.json({
    success: true,
    message: 'Route updated successfully',
    data: { route }
  });
}));

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private (Admin only)
router.delete('/:id', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const route = await Route.findById(req.params.id);
  
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Check if route has active buses
  const activeBuses = await Bus.find({ currentRoute: route._id, status: 'active' });
  if (activeBuses.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot delete route with active buses'
    });
  }

  // Don't actually delete, just deactivate
  route.isActive = false;
  await route.save();

  res.json({
    success: true,
    message: 'Route deactivated successfully'
  });
}));

// @desc    Add stop to route
// @route   POST /api/routes/:id/stops
// @access  Private (Admin only)
const axios = require("axios");

router.post('/:id/stops', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {

  const { name, address, estimatedTime } = req.body;
  const routeId = req.params.id;

  if (!name || !address) {
    return res.status(400).json({
      success: false,
      message: "Stop name and address are required"
    });
  }

  const route = await Route.findById(routeId);

  if (!route) {
    return res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }

  // 🔹 Convert address → coordinates using OpenStreetMap
  const geoResponse = await axios.get(
    `https://nominatim.openstreetmap.org/search`,
    {
      params: {
        q: address,
        format: "json",
        limit: 1
      },
      headers: {
        "User-Agent": "KIET-Traveller-App"
      }
    }
  );

  if (!geoResponse.data.length) {
    return res.status(400).json({
      success: false,
      message: "Address not found"
    });
  }

  const latitude = parseFloat(geoResponse.data[0].lat);
  const longitude = parseFloat(geoResponse.data[0].lon);

  const stopData = {
    name,
    address,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    },
    estimatedTime: estimatedTime || 0,
    sequence: route.stops.length
  };

  route.stops.push(stopData);

  await route.save();

  res.json({
    success: true,
    message: "Stop added successfully",
    data: { route }
  });

}));

// @desc    Remove stop from route
// @route   DELETE /api/routes/:id/stops/:stopId
// @access  Private (Admin only)
router.delete('/:id/stops/:stopId', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { id: routeId, stopId } = req.params;

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  await route.removeStop(stopId);

  res.json({
    success: true,
    message: 'Stop removed successfully',
    data: { route }
  });
}));

// @desc    Reorder stops
// @route   PUT /api/routes/:id/stops/reorder
// @access  Private (Admin only)
router.put('/:id/stops/reorder', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { stopIds } = req.body;
  const routeId = req.params.id;

  if (!stopIds || !Array.isArray(stopIds)) {
    return res.status(400).json({
      success: false,
      message: 'Stop IDs array is required'
    });
  }

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  await route.reorderStops(stopIds);

  res.json({
    success: true,
    message: 'Stops reordered successfully',
    data: { route }
  });
}));

// @desc    Assign bus to route
// @route   PUT /api/routes/:id/assign-bus
// @access  Private (Admin only)
router.put('/:id/assign-bus', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { busId } = req.body;
  const routeId = req.params.id;

  if (!busId) {
    return res.status(400).json({
      success: false,
      message: 'Bus ID is required'
    });
  }

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  const bus = await Bus.findById(busId);
  if (!bus) {
    return res.status(404).json({
      success: false,
      message: 'Bus not found'
    });
  }

  // Remove the bus from any previously assigned routes so one bus maps to one route assignment
  await Route.updateMany(
    { _id: { $ne: routeId }, assignedBuses: busId },
    { $pull: { assignedBuses: busId } }
  );

  // Add bus to route's assigned buses
  route.assignedBuses = [busId];
  await route.save();

  // Keep the bus record in sync with the route assignment shown in admin/driver dashboards
  bus.currentRoute = route._id;
  await bus.save();

  res.json({
    success: true,
    message: 'Bus assigned to route successfully',
    data: { route }
  });
}));

// @desc    Remove bus from route
// @route   PUT /api/routes/:id/remove-bus
// @access  Private (Admin only)
router.put('/:id/remove-bus', validateObjectId(), authorize('admin'), asyncHandler(async (req, res) => {
  const { busId } = req.body;
  const routeId = req.params.id;

  if (!busId) {
    return res.status(400).json({
      success: false,
      message: 'Bus ID is required'
    });
  }

  const route = await Route.findById(routeId);
  if (!route) {
    return res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  }

  // Remove bus from route's assigned buses
  route.assignedBuses = route.assignedBuses.filter(id => id.toString() !== busId);
  await route.save();

  const bus = await Bus.findById(busId);
  if (bus && bus.currentRoute && bus.currentRoute.toString() === routeId) {
    bus.currentRoute = null;
    await bus.save();
  }

  res.json({
    success: true,
    message: 'Bus removed from route successfully',
    data: { route }
  });
}));

// @desc    Get nearby routes
// @route   GET /api/routes/nearby
// @access  Private
router.get('/nearby', validateLocation, asyncHandler(async (req, res) => {
  const { latitude, longitude, maxDistance = 1000 } = req.query;

  const routes = await Route.findNearby(
    parseFloat(longitude),
    parseFloat(latitude),
    parseInt(maxDistance)
  ).populate('assignedBuses');

  res.json({
    success: true,
    data: { routes }
  });
}));

// @desc    Get active routes
// @route   GET /api/routes/active
// @access  Private
router.get('/active', asyncHandler(async (req, res) => {
  const routes = await Route.findActive()
    .populate('assignedBuses', 'busNumber status');

  res.json({
    success: true,
    data: { routes }
  });
}));

// @desc    Get routes by operating day
// @route   GET /api/routes/operating/:day
// @access  Private
router.get('/operating/:day', asyncHandler(async (req, res) => {
  const { day } = req.params;

  if (!['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].includes(day.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid day'
    });
  }

  const routes = await Route.findByOperatingDay(day)
    .populate('assignedBuses', 'busNumber status');

  res.json({
    success: true,
    data: { routes }
  });
}));

// @desc    Get route statistics
// @route   GET /api/routes/stats/overview
// @access  Private (Admin only)
router.get('/stats/overview', authorize('admin'), asyncHandler(async (req, res) => {
  const stats = await Route.aggregate([
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
        averageRating: { $avg: '$averageRating' },
        totalTrips: { $sum: '$totalTrips' },
        totalDistance: { $sum: '$totalDistance' },
        averageDuration: { $avg: '$estimatedDuration' }
      }
    },
    {
      $project: {
        _id: 0,
        totalRoutes: 1,
        activeRoutes: 1,
        inactiveRoutes: { $subtract: ['$totalRoutes', '$activeRoutes'] },
        popularRoutes: 1,
        averageRating: { $round: ['$averageRating', 2] },
        totalTrips: 1,
        totalDistance: { $round: ['$totalDistance', 2] },
        averageDuration: { $round: ['$averageDuration', 2] }
      }
    }
  ]);

  res.json({
    success: true,
    data: stats[0] || {
      totalRoutes: 0,
      activeRoutes: 0,
      inactiveRoutes: 0,
      popularRoutes: 0,
      averageRating: 0,
      totalTrips: 0,
      totalDistance: 0,
      averageDuration: 0
    }
  });
}));

module.exports = router;
