/**
 * Geofence utility — calculates distances and checks bus proximity to stops.
 * Uses the Haversine formula for accurate great-circle distances on Earth.
 */

const Route = require('../models/Route');
const User = require('../models/User');

// Default geofence radius in meters
const DEFAULT_RADIUS = 500;

/**
 * Haversine distance between two [lng, lat] coordinate pairs.
 * @returns {number} Distance in meters
 */
function haversineDistance(coord1, coord2) {
  const R = 6371000; // Earth radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Estimate ETA in minutes based on distance (meters) and speed (km/h).
 * Falls back to a default average speed of 25 km/h if speed is 0 or missing.
 */
function estimateETA(distanceMeters, speedKmh) {
  const speed = speedKmh > 0 ? speedKmh : 25; // default 25 km/h campus speed
  const distanceKm = distanceMeters / 1000;
  return Math.round((distanceKm / speed) * 60); // minutes
}

// Track which bus+stop combos have already triggered an alert
// so we don't spam the user. Key: `${busId}_${stopId}`, Value: timestamp
const alertedPairs = new Map();

// How long (ms) before re-alerting the same bus+stop combo
const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a bus location is within range of any stops on its assigned route.
 * Returns an array of { stop, distance, eta } objects for stops within range.
 *
 * @param {Object} bus        - Populated Bus document (must have currentRoute with stops)
 * @param {Object} routeDoc   - The Route document with stops array
 * @returns {Array} Array of triggered stops
 */
function checkBusProximityToStops(bus, routeDoc) {
  if (!routeDoc || !routeDoc.stops || routeDoc.stops.length === 0) return [];
  if (
    !bus.currentLocation ||
    !bus.currentLocation.coordinates ||
    (bus.currentLocation.coordinates[0] === 0 && bus.currentLocation.coordinates[1] === 0)
  ) {
    return [];
  }

  const busCoords = bus.currentLocation.coordinates; // [lng, lat]
  const results = [];

  for (const stop of routeDoc.stops) {
    if (!stop.location || !stop.location.coordinates) continue;
    if (!stop.isActive) continue;

    const stopCoords = stop.location.coordinates; // [lng, lat]
    const distance = haversineDistance(busCoords, stopCoords);

    // We check against the largest possible user radius (5000m)
    // and let the per-user filtering happen when we emit
    if (distance <= 5000) {
      const pairKey = `${bus._id}_${stop._id}`;
      const lastAlerted = alertedPairs.get(pairKey);

      if (lastAlerted && Date.now() - lastAlerted < ALERT_COOLDOWN_MS) {
        continue; // Skip — recently alerted
      }

      const eta = estimateETA(distance, bus.currentSpeed);

      results.push({
        stopId: stop._id.toString(),
        stopName: stop.name,
        stopCoordinates: stopCoords,
        distance: Math.round(distance),
        eta,
        sequence: stop.sequence
      });

      alertedPairs.set(pairKey, Date.now());
    }
  }

  return results;
}

/**
 * Find users who should be notified about a bus approaching a stop.
 * Filters by geofence being enabled and the stop matching their assigned stop.
 *
 * @param {string} stopId  - The stop ObjectId
 * @param {number} distance - The distance in meters from bus to stop
 * @returns {Promise<Array>} Array of user documents
 */
async function findSubscribedUsers(stopId, distance) {
  const users = await User.find({
    'geofence.enabled': true,
    'geofence.assignedStopId': stopId,
    isActive: true,
    role: { $in: ['student', 'staff'] }
  }).select('_id firstName lastName email geofence');

  // Filter: only return users whose configured radius >= the actual distance
  return users.filter((user) => {
    const userRadius = user.geofence?.radius || DEFAULT_RADIUS;
    return distance <= userRadius;
  });
}

/**
 * Main geofence processing function.
 * Call this every time a driver updates their bus location.
 *
 * @param {Object} bus      - The Bus document (with currentLocation populated)
 * @param {Object} io       - Socket.IO server instance
 */
async function processGeofence(bus, io) {
  try {
    if (!bus.currentRoute) return;

    // Load the route with stops
    const routeId = typeof bus.currentRoute === 'object' ? bus.currentRoute._id : bus.currentRoute;
    const route = await Route.findById(routeId);
    if (!route) return;

    const triggeredStops = checkBusProximityToStops(bus, route);

    for (const stopInfo of triggeredStops) {
      const subscribedUsers = await findSubscribedUsers(stopInfo.stopId, stopInfo.distance);

      for (const user of subscribedUsers) {
        const alertPayload = {
          type: 'geofence_alert',
          busId: bus._id,
          busNumber: bus.busNumber,
          routeNumber: route.routeNumber,
          routeName: route.name,
          stop: {
            id: stopInfo.stopId,
            name: stopInfo.stopName,
            sequence: stopInfo.sequence
          },
          distance: stopInfo.distance,
          eta: stopInfo.eta,
          busSpeed: bus.currentSpeed || 0,
          busOccupancy: bus.currentOccupancy || 0,
          busCapacity: bus.capacity || 0,
          busLocation: bus.currentLocation,
          timestamp: new Date()
        };

        // Emit to the specific user's room
        io.to(`user_${user._id}`).emit('geofenceAlert', alertPayload);
      }
    }
  } catch (error) {
    console.error('Geofence processing error:', error);
  }
}

/**
 * Periodically clean up stale entries in the alertedPairs map.
 */
function cleanupAlertedPairs() {
  const now = Date.now();
  for (const [key, timestamp] of alertedPairs.entries()) {
    if (now - timestamp > ALERT_COOLDOWN_MS * 2) {
      alertedPairs.delete(key);
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupAlertedPairs, 10 * 60 * 1000);

module.exports = {
  haversineDistance,
  estimateETA,
  checkBusProximityToStops,
  findSubscribedUsers,
  processGeofence,
  DEFAULT_RADIUS
};
