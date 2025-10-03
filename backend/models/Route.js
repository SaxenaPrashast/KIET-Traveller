const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Stop name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Stop coordinates are required']
    }
  },
  address: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  estimatedTime: {
    type: Number, // in minutes from previous stop
    default: 0
  },
  sequence: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  _id: true
});

const routeSchema = new mongoose.Schema({
  routeNumber: {
    type: String,
    required: [true, 'Route number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Route name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  stops: [stopSchema],
  startStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  endStop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stop',
    required: true
  },
  totalDistance: {
    type: Number, // in kilometers
    default: 0
  },
  estimatedDuration: {
    type: Number, // in minutes
    required: [true, 'Estimated duration is required'],
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isCircular: {
    type: Boolean,
    default: false
  },
  operatingDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  operatingHours: {
    start: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: '06:00'
    },
    end: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
      default: '22:00'
    }
  },
  frequency: {
    type: Number, // in minutes
    required: [true, 'Frequency is required'],
    min: 5,
    max: 120
  },
  fare: {
    type: Number,
    default: 0,
    min: 0
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  features: [{
    type: String,
    enum: ['AC', 'Non-AC', 'Express', 'Local', 'Wheelchair_Accessible']
  }],
  // Route statistics
  totalTrips: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  // Route preferences
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  // Route management
  assignedBuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ isActive: 1 });
routeSchema.index({ 'stops.location': '2dsphere' });
routeSchema.index({ operatingDays: 1 });
routeSchema.index({ isPopular: 1 });

// Virtual for total stops
routeSchema.virtual('totalStops').get(function() {
  return this.stops.length;
});

// Virtual for route status
routeSchema.virtual('status').get(function() {
  if (!this.isActive) return 'inactive';
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
  
  const startTime = this.operatingHours.start;
  const endTime = this.operatingHours.end;
  
  if (currentTime >= startTime && currentTime <= endTime) {
    return 'operating';
  }
  return 'closed';
});

// Method to add stop
routeSchema.methods.addStop = function(stopData) {
  const sequence = this.stops.length;
  const stop = {
    ...stopData,
    sequence
  };
  this.stops.push(stop);
  return this.save();
};

// Method to remove stop
routeSchema.methods.removeStop = function(stopId) {
  this.stops = this.stops.filter(stop => stop._id.toString() !== stopId);
  // Reorder sequences
  this.stops.forEach((stop, index) => {
    stop.sequence = index;
  });
  return this.save();
};

// Method to reorder stops
routeSchema.methods.reorderStops = function(stopIds) {
  const stopsMap = new Map(this.stops.map(stop => [stop._id.toString(), stop]));
  this.stops = stopIds.map((id, index) => {
    const stop = stopsMap.get(id);
    if (stop) {
      stop.sequence = index;
      return stop;
    }
    return null;
  }).filter(Boolean);
  return this.save();
};

// Method to calculate distance between stops
routeSchema.methods.calculateDistance = function() {
  // This would typically use a mapping service API
  // For now, we'll use a simple calculation
  let totalDistance = 0;
  for (let i = 0; i < this.stops.length - 1; i++) {
    const stop1 = this.stops[i];
    const stop2 = this.stops[i + 1];
    
    // Simple distance calculation (not accurate for real-world distances)
    const lat1 = stop1.location.coordinates[1];
    const lon1 = stop1.location.coordinates[0];
    const lat2 = stop2.location.coordinates[1];
    const lon2 = stop2.location.coordinates[0];
    
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    totalDistance += distance;
  }
  
  this.totalDistance = totalDistance;
  return this.save();
};

// Static method to find active routes
routeSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Static method to find routes by operating day
routeSchema.statics.findByOperatingDay = function(day) {
  return this.find({ 
    isActive: true,
    operatingDays: day.toLowerCase()
  });
};

// Static method to find nearby routes
routeSchema.statics.findNearby = function(longitude, latitude, maxDistance = 1000) {
  return this.find({
    'stops.location': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

module.exports = mongoose.model('Route', routeSchema);
