const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['general', 'route', 'bus', 'driver', 'schedule', 'app', 'service'],
    required: [true, 'Feedback type is required']
  },
  // Related entities
  relatedRoute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  relatedBus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  },
  relatedDriver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  // Rating
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  // Feedback content
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  // Categories
  categories: [{
    type: String,
    enum: [
      'punctuality', 'cleanliness', 'comfort', 'safety', 'driver_behavior',
      'route_efficiency', 'app_usability', 'customer_service', 'pricing',
      'accessibility', 'communication', 'maintenance', 'other'
    ]
  }],
  // Status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'in_progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },
  // Priority
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Response
  response: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Response message cannot exceed 500 characters']
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  // Resolution
  resolution: {
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution description cannot exceed 500 characters']
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    actions: [{
      description: {
        type: String,
        required: true
      },
      completed: {
        type: Boolean,
        default: false
      },
      completedAt: {
        type: Date,
        default: null
      }
    }]
  },
  // Follow-up
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date,
    default: null
  },
  followUpCompleted: {
    type: Boolean,
    default: false
  },
  followUpNotes: {
    type: String,
    trim: true
  },
  // Attachments
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
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
      enum: ['view', 'like', 'dislike', 'share', 'comment'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ type: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ relatedRoute: 1 });
feedbackSchema.index({ relatedBus: 1 });
feedbackSchema.index({ relatedDriver: 1 });
feedbackSchema.index({ isPublic: 1 });

// Virtual for net rating (likes - dislikes)
feedbackSchema.virtual('netRating').get(function() {
  return this.likes - this.dislikes;
});

// Virtual for response time
feedbackSchema.virtual('responseTime').get(function() {
  if (!this.response.respondedAt) return null;
  return Math.round((this.response.respondedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // in days
});

// Virtual for resolution time
feedbackSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution.resolvedAt) return null;
  return Math.round((this.resolution.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // in days
});

// Method to add user interaction
feedbackSchema.methods.addUserInteraction = function(userId, action) {
  // Remove existing interaction of same type from same user
  this.userInteractions = this.userInteractions.filter(
    interaction => !(interaction.user.toString() === userId.toString() && interaction.action === action)
  );
  
  // Add new interaction
  this.userInteractions.push({
    user: userId,
    action,
    timestamp: new Date()
  });
  
  // Update counts
  if (action === 'like') {
    this.likes += 1;
  } else if (action === 'dislike') {
    this.dislikes += 1;
  } else if (action === 'view') {
    this.views += 1;
  }
  
  return this.save();
};

// Method to respond to feedback
feedbackSchema.methods.respond = function(message, respondedBy) {
  this.response = {
    message,
    respondedBy,
    respondedAt: new Date()
  };
  this.status = 'under_review';
  return this.save();
};

// Method to resolve feedback
feedbackSchema.methods.resolve = function(description, resolvedBy, actions = []) {
  this.resolution = {
    description,
    resolvedBy,
    resolvedAt: new Date(),
    actions
  };
  this.status = 'resolved';
  return this.save();
};

// Method to close feedback
feedbackSchema.methods.close = function() {
  this.status = 'closed';
  return this.save();
};

// Method to reject feedback
feedbackSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to add attachment
feedbackSchema.methods.addAttachment = function(attachmentData) {
  this.attachments.push({
    ...attachmentData,
    uploadedAt: new Date()
  });
  return this.save();
};

// Static method to find by user
feedbackSchema.statics.findByUser = function(userId, options = {}) {
  const query = { user: userId };
  
  if (options.type) {
    query.type = options.type;
  }
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  return this.find(query)
    .populate('relatedRoute relatedBus relatedDriver relatedSchedule')
    .sort({ createdAt: -1 });
};

// Static method to find by route
feedbackSchema.statics.findByRoute = function(routeId, options = {}) {
  const query = { relatedRoute: routeId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  return this.find(query)
    .populate('user relatedRoute relatedBus relatedDriver')
    .sort({ createdAt: -1 });
};

// Static method to find by bus
feedbackSchema.statics.findByBus = function(busId, options = {}) {
  const query = { relatedBus: busId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.rating) {
    query.rating = options.rating;
  }
  
  if (options.isPublic !== undefined) {
    query.isPublic = options.isPublic;
  }
  
  return this.find(query)
    .populate('user relatedRoute relatedBus relatedDriver')
    .sort({ createdAt: -1 });
};

// Static method to get feedback stats
feedbackSchema.statics.getStats = function(startDate, endDate) {
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
        totalFeedback: { $sum: 1 },
        averageRating: { $avg: '$rating' },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        totalDislikes: { $sum: '$dislikes' },
        statusCounts: {
          $push: {
            status: '$status',
            count: 1
          }
        },
        ratingCounts: {
          $push: {
            rating: '$rating',
            count: 1
          }
        }
      }
    }
  ]);
};

// Static method to find pending feedback
feedbackSchema.statics.findPending = function() {
  return this.find({ status: 'pending' })
    .populate('user relatedRoute relatedBus relatedDriver')
    .sort({ createdAt: -1 });
};

// Static method to find high priority feedback
feedbackSchema.statics.findHighPriority = function() {
  return this.find({ 
    priority: { $in: ['high', 'urgent'] },
    status: { $in: ['pending', 'under_review'] }
  })
    .populate('user relatedRoute relatedBus relatedDriver')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Feedback', feedbackSchema);
