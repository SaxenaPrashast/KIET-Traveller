const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '.env');
// console.log('Loading .env from:', envPath);
// console.log('.env file exists:', fs.existsSync(envPath));

const dotenvResult = require('dotenv').config({ path: envPath, override: true });
if (dotenvResult.error) {
  console.error('Error loading .env file:', dotenvResult.error);
} else {
  // console.log('Successfully parsed .env file');
  // console.log('Parsed variables:', Object.keys(dotenvResult.parsed || {}));
  if (dotenvResult.parsed) {
    // console.log('MONGODB_URI from dotenv:', dotenvResult.parsed.MONGODB_URI ? '(present)' : '(NOT present in parsed)');
  }
}

// Log presence of the variable (don't print secrets)
console.log('MONGODB_URI in process.env:', Boolean(process.env.MONGODB_URI));
if (process.env.MONGODB_URI) {
  // console.log('Connection string starts with:', process.env.MONGODB_URI.substring(0, 20) + '...');
}

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const busRoutes = require('./routes/buses');
const routeRoutes = require('./routes/routes');
const scheduleRoutes = require('./routes/schedules');
const trackingRoutes = require('./routes/tracking');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');
const chatbotRoutes = require('./routes/chatbot');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Import socket handlers
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:4028",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const isProduction = process.env.NODE_ENV === 'production';

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});

if (isProduction) {
  app.use(limiter);
}


// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
// app.use(limiter);
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:4028",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/buses', authenticateToken, busRoutes);
app.use('/api/routes', authenticateToken, routeRoutes);
app.use('/api/schedules', authenticateToken, scheduleRoutes);
app.use('/api/tracking', authenticateToken, trackingRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Socket.IO connection handling
const socketHandlers = socketHandler(io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use(errorHandler);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kiet_traveller')
.then(() => {
  console.log('✅ Connected to MongoDB');

  console.log("DB NAME:", mongoose.connection.name);
  console.log("DB HOST:", mongoose.connection.host);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  // console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    mongoose.connection.close();
  });
});

const basePort = parseInt(process.env.PORT, 10) || 5000;
let currentPort = basePort;

const startServer = (port) => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('📡 Socket.IO server ready');
  });
};

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    const nextPort = currentPort + 1;
    console.warn(`Port ${currentPort} is in use. Trying ${nextPort}...`);
    currentPort = nextPort;
    startServer(currentPort);
    return;
  }

  console.error('Server error:', error);
  process.exit(1);
});

app.use(express.static(path.join(__dirname, '/dist')));
startServer(currentPort);

module.exports = { app, server, io };
