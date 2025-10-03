const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'delay', 'cancellation', 'route_change', 'maintenance'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Recipients
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Targeting
  targetRoles: [{
    type: String,
    enum: ['student', 'staff', 'driver', 'admin']
  }],
  targetRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  }],
  targetBuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],
  // Delivery channels
  channels: [{
    type: String,
    enum: ['email', 'push', 'sms', 'in_app'],
    default: ['in_app']
  }],
  // Scheduling
  scheduledFor: {
    type: Date,
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  },
  // Status tracking
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },
  // Delivery tracking
  deliveryStats: {
    totalSent: {
      type: Number,
      default: 0
    },
    totalDelivered: {
      type: Number,
      default: 0
    },
    totalRead: {
      type: Number,
      default: 0
    },
    totalFailed: {
      type: Number,
      default: 0
    },
    deliveryRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    readRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  },
  // User interactions
  userInteractions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'clicked', 'dismissed'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  // Related entities
  relatedSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  relatedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  relatedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  },
  // Content
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Actions
  actions: [{
    label: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    style: {
      type: String,
      enum: ['primary', 'secondary', 'success', 'warning', 'error'],
      default: 'primary'
    }
  }],
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
notificationSchema.index({ recipients: 1, createdAt: -1 });
notificationSchema.index({ targetRoles: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ scheduledFor: 1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ createdBy: 1 });

// Virtual for read rate
notificationSchema.virtual('readRatePercentage').get(function() {
  if (this.deliveryStats.totalDelivered === 0) return 0;
  return Math.round((this.deliveryStats.totalRead / this.deliveryStats.totalDelivered) * 100);
});

// Virtual for delivery rate
notificationSchema.virtual('deliveryRatePercentage').get(function() {
  if (this.deliveryStats.totalSent === 0) return 0;
  return Math.round((this.deliveryStats.totalDelivered / this.deliveryStats.totalSent) * 100);
});

// Method to add recipient
notificationSchema.methods.addRecipient = function(userId) {
  if (!this.recipients.includes(userId)) {
    this.recipients.push(userId);
  }
  return this.save();
};

// Method to remove recipient
notificationSchema.methods.removeRecipient = function(userId) {
  this.recipients = this.recipients.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Method to record user interaction
notificationSchema.methods.recordInteraction = function(userId, action, metadata = {}) {
  this.userInteractions.push({
    user: userId,
    action,
    metadata,
    timestamp: new Date()
  });
  
  // Update delivery stats
  if (action === 'delivered') {
    this.deliveryStats.totalDelivered += 1;
  } else if (action === 'read') {
    this.deliveryStats.totalRead += 1;
  } else if (action === 'failed') {
    this.deliveryStats.totalFailed += 1;
  }
  
  // Update rates
  this.deliveryStats.deliveryRate = this.deliveryRatePercentage;
  this.deliveryStats.readRate = this.readRatePercentage;
  
  return this.save();
};

// Method to send notification
notificationSchema.methods.send = function() {
  this.status = 'sending';
  this.deliveryStats.totalSent = this.recipients.length;
  return this.save();
};

// Method to mark as sent
notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  return this.save();
};

// Method to mark as failed
notificationSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this.save();
};

// Method to cancel notification
notificationSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Static method to find by recipient
notificationSchema.statics.findByRecipient = function(userId, options = {}) {
  const query = { recipients: userId };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  return this.find(query)
    .populate('relatedSchedule relatedRoute relatedBus createdBy')
    .sort({ createdAt: -1 });
};

// Static method to find by role
notificationSchema.statics.findByRole = function(role, options = {}) {
  const query = { targetRoles: role };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.priority) {
    query.priority = options.priority;
  }
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  return this.find(query)
    .populate('relatedSchedule relatedRoute relatedBus createdBy')
    .sort({ createdAt: -1 });
};

// Static method to find scheduled notifications
notificationSchema.statics.findScheduled = function() {
  const now = new Date();
  return this.find({
    status: 'scheduled',
    scheduledFor: { $lte: now },
    isActive: true
  });
};

// Static method to find expired notifications
notificationSchema.statics.findExpired = function() {
  const now = new Date();
  return this.find({
    expiresAt: { $lt: now },
    isActive: true
  });
};

// Static method to get notification stats
notificationSchema.statics.getStats = function(startDate, endDate) {
  const matchStage = {
    createdAt: {
      $gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Default to last 30 days
      $lte: endDate || new Date()
    }
  };
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalNotifications: { $sum: 1 },
        totalSent: { $sum: '$deliveryStats.totalSent' },
        totalDelivered: { $sum: '$deliveryStats.totalDelivered' },
        totalRead: { $sum: '$deliveryStats.totalRead' },
        totalFailed: { $sum: '$deliveryStats.totalFailed' },
        averageDeliveryRate: { $avg: '$deliveryStats.deliveryRate' },
        averageReadRate: { $avg: '$deliveryStats.readRate' }
      }
    }
  ]);
};

module.exports = mongoose.model('Notification', notificationSchema);
