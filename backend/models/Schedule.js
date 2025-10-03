const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route is required']
  },
  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: [true, 'Bus is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'delayed'],
    default: 'scheduled'
  },
  // Trip details
  tripType: {
    type: String,
    enum: ['regular', 'special', 'emergency', 'maintenance'],
    default: 'regular'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: null
  },
  recurringDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  // Actual trip data
  actualStartTime: {
    type: Date,
    default: null
  },
  actualEndTime: {
    type: Date,
    default: null
  },
  actualDuration: {
    type: Number, // in minutes
    default: null
  },
  // Passenger data
  totalPassengers: {
    type: Number,
    default: 0,
    min: 0
  },
  maxOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  averageOccupancy: {
    type: Number,
    default: 0,
    min: 0
  },
  // Delay information
  delayMinutes: {
    type: Number,
    default: 0,
    min: 0
  },
  delayReason: {
    type: String,
    trim: true
  },
  // Route progress
  currentStopIndex: {
    type: Number,
    default: 0,
    min: 0
  },
  completedStops: [{
    stopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stop'
    },
    arrivalTime: {
      type: Date,
      required: true
    },
    departureTime: {
      type: Date,
      required: true
    },
    passengersBoarded: {
      type: Number,
      default: 0,
      min: 0
    },
    passengersAlighted: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  // Performance metrics
  onTimePerformance: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  fuelConsumption: {
    type: Number,
    default: 0,
    min: 0
  },
  // Notifications
  notificationsSent: [{
    type: {
      type: String,
      enum: ['delay', 'cancellation', 'route_change', 'maintenance']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  // Comments and notes
  notes: {
    type: String,
    trim: true
  },
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
scheduleSchema.index({ route: 1, date: 1 });
scheduleSchema.index({ bus: 1, date: 1 });
scheduleSchema.index({ driver: 1, date: 1 });
scheduleSchema.index({ status: 1 });
scheduleSchema.index({ date: 1, startTime: 1 });
scheduleSchema.index({ isRecurring: 1 });

// Virtual for trip duration
scheduleSchema.virtual('duration').get(function() {
  if (this.actualStartTime && this.actualEndTime) {
    return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  
  // Calculate from start and end time strings
  const start = new Date(`2000-01-01T${this.startTime}:00`);
  const end = new Date(`2000-01-01T${this.endTime}:00`);
  return Math.round((end - start) / (1000 * 60));
});

// Virtual for occupancy percentage
scheduleSchema.virtual('occupancyPercentage').get(function() {
  if (this.maxOccupancy === 0) return 0;
  return Math.round((this.averageOccupancy / this.maxOccupancy) * 100);
});

// Method to start trip
scheduleSchema.methods.startTrip = function() {
  this.status = 'in_progress';
  this.actualStartTime = new Date();
  return this.save();
};

// Method to complete trip
scheduleSchema.methods.completeTrip = function() {
  this.status = 'completed';
  this.actualEndTime = new Date();
  if (this.actualStartTime) {
    this.actualDuration = Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60));
  }
  return this.save();
};

// Method to cancel trip
scheduleSchema.methods.cancelTrip = function(reason) {
  this.status = 'cancelled';
  this.notes = reason || this.notes;
  return this.save();
};

// Method to update delay
scheduleSchema.methods.updateDelay = function(delayMinutes, reason) {
  this.delayMinutes = delayMinutes;
  this.delayReason = reason;
  this.status = 'delayed';
  return this.save();
};

// Method to add stop completion
scheduleSchema.methods.addStopCompletion = function(stopData) {
  this.completedStops.push({
    ...stopData,
    arrivalTime: new Date()
  });
  this.currentStopIndex = this.completedStops.length;
  return this.save();
};

// Method to update occupancy
scheduleSchema.methods.updateOccupancy = function(currentOccupancy) {
  this.totalPassengers = Math.max(this.totalPassengers, currentOccupancy);
  this.maxOccupancy = Math.max(this.maxOccupancy, currentOccupancy);
  
  // Calculate average occupancy
  const totalStops = this.completedStops.length;
  if (totalStops > 0) {
    const totalOccupancy = this.completedStops.reduce((sum, stop) => 
      sum + (stop.passengersBoarded - stop.passengersAlighted), 0);
    this.averageOccupancy = totalOccupancy / totalStops;
  }
  
  return this.save();
};

// Static method to find schedules by date range
scheduleSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate
    }
  }).populate('route bus driver');
};

// Static method to find schedules by route
scheduleSchema.statics.findByRoute = function(routeId, date) {
  const query = { route: routeId };
  if (date) {
    query.date = date;
  }
  return this.find(query).populate('route bus driver');
};

// Static method to find schedules by driver
scheduleSchema.statics.findByDriver = function(driverId, date) {
  const query = { driver: driverId };
  if (date) {
    query.date = date;
  }
  return this.find(query).populate('route bus driver');
};

// Static method to find active schedules
scheduleSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['scheduled', 'in_progress'] },
    date: { $gte: new Date() }
  }).populate('route bus driver');
};

// Static method to find today's schedules
scheduleSchema.statics.findToday = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return this.find({
    date: {
      $gte: today,
      $lt: tomorrow
    }
  }).populate('route bus driver');
};

module.exports = mongoose.model('Schedule', scheduleSchema);
