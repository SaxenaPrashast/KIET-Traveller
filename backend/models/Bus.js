const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: {
    type: String,
    required: [true, 'Bus number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  model: {
    type: String,
    required: [true, 'Bus model is required'],
    trim: true
  },
  manufacturer: {
    type: String,
    required: [true, 'Manufacturer is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1990, 'Year must be 1990 or later'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  features: [{
    type: String,
    enum: ['AC', 'Non-AC', 'GPS', 'Camera', 'Wheelchair_Accessible', 'WiFi', 'Charging_Ports']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: false
    }
  },
  currentRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    default: null
  },
  assignedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  lastMaintenanceDate: {
    type: Date,
    default: null
  },
  nextMaintenanceDate: {
    type: Date,
    default: null
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'],
    default: 'Diesel'
  },
  insuranceExpiry: {
    type: Date,
    default: null
  },
  permitExpiry: {
    type: Date,
    default: null
  },
  isTrackingEnabled: {
    type: Boolean,
    default: true
  },
  trackingDeviceId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  // Real-time tracking data
  currentStatus: {
    type: String,
    enum: ['idle', 'in_transit', 'at_stop', 'breakdown', 'maintenance'],
    default: 'idle'
  },
  currentSpeed: {
    type: Number,
    default: 0,
    min: 0,
    max: 120
  },
  currentOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLocationUpdate: {
    type: Date,
    default: null
  },
  // Route progress
  currentStopIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  nextStopETA: {
    type: Number, // in minutes
    default: null
  },
  estimatedArrival: {
    type: Date,
    default: null
  },
  delay: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for geospatial queries
busSchema.index({ currentLocation: '2dsphere' });
busSchema.index({ status: 1 });
busSchema.index({ currentRoute: 1 });
busSchema.index({ assignedDriver: 1 });

// Virtual for occupancy percentage
busSchema.virtual('occupancyPercentage').get(function() {
  return Math.round((this.currentOccupancy / this.capacity) * 100);
});

// Virtual for maintenance status
busSchema.virtual('maintenanceStatus').get(function() {
  if (!this.nextMaintenanceDate) return 'unknown';
  
  const daysUntilMaintenance = Math.ceil((this.nextMaintenanceDate - new Date()) / (1000 * 60 * 60 * 24));
  
  if (daysUntilMaintenance < 0) return 'overdue';
  if (daysUntilMaintenance <= 7) return 'due_soon';
  if (daysUntilMaintenance <= 30) return 'due_later';
  return 'good';
});

// Method to update location
busSchema.methods.updateLocation = function(latitude, longitude) {
  this.currentLocation = {
    type: 'Point',
    coordinates: [longitude, latitude]
  };
  this.lastLocationUpdate = new Date();
  return this.save();
};

// Method to update occupancy
busSchema.methods.updateOccupancy = function(occupancy) {
  if (occupancy >= 0 && occupancy <= this.capacity) {
    this.currentOccupancy = occupancy;
    return this.save();
  }
  throw new Error('Invalid occupancy value');
};

// Method to start route
busSchema.methods.startRoute = function(routeId) {
  this.currentRoute = routeId;
  this.currentStatus = 'in_transit';
  this.currentStopIndex = 0;
  return this.save();
};

// Method to end route
busSchema.methods.endRoute = function() {
  this.currentRoute = null;
  this.currentStatus = 'idle';
  this.currentStopIndex = 0;
  this.currentOccupancy = 0;
  return this.save();
};

// Static method to find active buses
busSchema.statics.findActive = function() {
  return this.find({ status: 'active', isTrackingEnabled: true });
};

// Static method to find buses by route
busSchema.statics.findByRoute = function(routeId) {
  return this.find({ currentRoute: routeId, status: 'active' });
};

// Static method to find nearby buses
busSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    currentLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    status: 'active'
  });
};

module.exports = mongoose.model('Bus', busSchema);
