const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUser = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters'),
  body('role')
    .isIn(['student', 'staff', 'driver', 'admin'])
    .withMessage('Role must be one of: student, staff, driver, admin'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Login validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('role')
    .isIn(['student', 'staff', 'driver', 'admin'])
    .withMessage('Role must be one of: student, staff, driver, admin'),
  handleValidationErrors
];

// Bus validation rules
const validateBus = [
  body('busNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Bus number is required and must be less than 20 characters'),
  body('registrationNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Registration number is required and must be less than 20 characters'),
  body('model')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Model is required and must be less than 50 characters'),
  body('manufacturer')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Manufacturer is required and must be less than 50 characters'),
  body('year')
    .isInt({ min: 1990, max: new Date().getFullYear() + 1 })
    .withMessage('Year must be between 1990 and current year + 1'),
  body('capacity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Capacity must be between 1 and 100'),
  body('fuelType')
    .optional()
    .isIn(['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'])
    .withMessage('Fuel type must be one of: Petrol, Diesel, CNG, Electric, Hybrid'),
  handleValidationErrors
];

// Route validation rules
const validateRoute = [
  body('routeNumber')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Route number is required and must be less than 20 characters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Route name is required and must be less than 100 characters'),
  body('estimatedDuration')
    .isInt({ min: 1 })
    .withMessage('Estimated duration must be a positive integer (minutes)'),
  body('frequency')
    .isInt({ min: 5, max: 120 })
    .withMessage('Frequency must be between 5 and 120 minutes'),
  body('capacity')
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('operatingHours.start')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('operatingHours.end')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('operatingDays')
    .isArray({ min: 1 })
    .withMessage('At least one operating day is required'),
  body('operatingDays.*')
    .isIn(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
    .withMessage('Invalid operating day'),
  handleValidationErrors
];

// Schedule validation rules
const validateSchedule = [
  body('route')
    .isMongoId()
    .withMessage('Valid route ID is required'),
  body('bus')
    .isMongoId()
    .withMessage('Valid bus ID is required'),
  body('driver')
    .isMongoId()
    .withMessage('Valid driver ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('startTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('endTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('tripType')
    .optional()
    .isIn(['regular', 'special', 'emergency', 'maintenance'])
    .withMessage('Invalid trip type'),
  handleValidationErrors
];

// Notification validation rules
const validateNotification = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Message is required and must be less than 500 characters'),
  body('type')
    .isIn(['info', 'warning', 'error', 'success', 'delay', 'cancellation', 'route_change', 'maintenance'])
    .withMessage('Invalid notification type'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Invalid priority level'),
  body('channels')
    .optional()
    .isArray()
    .withMessage('Channels must be an array'),
  body('channels.*')
    .isIn(['email', 'push', 'sms', 'in_app'])
    .withMessage('Invalid channel type'),
  handleValidationErrors
];

// Feedback validation rules
const validateFeedback = [
  body('type')
    .isIn(['general', 'route', 'bus', 'driver', 'schedule', 'app', 'service'])
    .withMessage('Invalid feedback type'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description is required and must be less than 1000 characters'),
  body('categories')
    .optional()
    .isArray()
    .withMessage('Categories must be an array'),
  body('categories.*')
    .isIn([
      'punctuality', 'cleanliness', 'comfort', 'safety', 'driver_behavior',
      'route_efficiency', 'app_usability', 'customer_service', 'pricing',
      'accessibility', 'communication', 'maintenance', 'other'
    ])
    .withMessage('Invalid category'),
  handleValidationErrors
];

// Location validation rules
const validateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'rating', 'date'])
    .withMessage('Invalid sort field'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  handleValidationErrors
];

// ID parameter validation
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),
  handleValidationErrors
];

// Search validation
const validateSearch = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('type')
    .optional()
    .isIn(['user', 'bus', 'route', 'schedule', 'notification', 'feedback'])
    .withMessage('Invalid search type'),
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => [
  (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files || [req.file];
    
    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File size must be less than ${maxSize / (1024 * 1024)}MB`
        });
      }

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: `File type must be one of: ${allowedTypes.join(', ')}`
        });
      }
    }

    next();
  }
];

module.exports = {
  handleValidationErrors,
  validateUser,
  validateLogin,
  validateBus,
  validateRoute,
  validateSchedule,
  validateNotification,
  validateFeedback,
  validateLocation,
  validatePagination,
  validateObjectId,
  validateSearch,
  validateDateRange,
  validateFileUpload
};
