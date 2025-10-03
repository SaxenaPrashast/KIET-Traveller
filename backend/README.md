# KIET Traveller Backend API

A comprehensive backend API for the KIET Bus Tracking System built with Node.js, Express, MongoDB, and Socket.io.

## 🚀 Features

- **User Management**: Complete user authentication and authorization system
- **Real-time Tracking**: Live bus location tracking with Socket.io
- **Route Management**: Dynamic route creation and management
- **Schedule Management**: Bus schedule creation and tracking
- **Notification System**: Real-time notifications for users
- **Feedback System**: User feedback collection and management
- **Admin Dashboard**: Comprehensive admin panel with analytics
- **File Upload**: Support for profile images and attachments
- **Data Validation**: Comprehensive input validation and sanitization
- **Error Handling**: Robust error handling and logging
- **Rate Limiting**: API rate limiting for security
- **CORS Support**: Cross-origin resource sharing configuration

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Real-time**: Socket.io
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **File Upload**: Multer
- **Security**: Helmet, bcryptjs
- **Environment**: dotenv

## 📋 Prerequisites

- Node.js (v16.0.0 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kiet_traveller/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/kiet_traveller
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### API Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /refresh` - Refresh JWT token
- `POST /logout` - User logout
- `GET /me` - Get current user
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /forgot-password` - Forgot password
- `POST /reset-password` - Reset password

#### Users (`/api/users`)
- `GET /` - Get all users (Admin only)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user
- `DELETE /:id` - Delete user (Admin only)
- `GET /stats/overview` - Get user statistics (Admin only)
- `GET /role/:role` - Get users by role (Admin only)
- `GET /search` - Search users (Admin only)

#### Buses (`/api/buses`)
- `GET /` - Get all buses
- `GET /:id` - Get bus by ID
- `POST /` - Create bus (Admin only)
- `PUT /:id` - Update bus (Admin only)
- `DELETE /:id` - Delete bus (Admin only)
- `PUT /:id/assign-driver` - Assign driver to bus (Admin only)
- `PUT /:id/location` - Update bus location (Driver only)
- `PUT /:id/start-route` - Start route (Driver only)
- `PUT /:id/end-route` - End route (Driver only)
- `GET /nearby` - Get nearby buses
- `GET /active` - Get active buses
- `GET /stats/overview` - Get bus statistics (Admin only)

#### Routes (`/api/routes`)
- `GET /` - Get all routes
- `GET /:id` - Get route by ID
- `POST /` - Create route (Admin only)
- `PUT /:id` - Update route (Admin only)
- `DELETE /:id` - Delete route (Admin only)
- `POST /:id/stops` - Add stop to route (Admin only)
- `DELETE /:id/stops/:stopId` - Remove stop from route (Admin only)
- `PUT /:id/stops/reorder` - Reorder stops (Admin only)
- `PUT /:id/assign-bus` - Assign bus to route (Admin only)
- `PUT /:id/remove-bus` - Remove bus from route (Admin only)
- `GET /nearby` - Get nearby routes
- `GET /active` - Get active routes
- `GET /operating/:day` - Get routes by operating day
- `GET /stats/overview` - Get route statistics (Admin only)

#### Schedules (`/api/schedules`)
- `GET /` - Get all schedules
- `GET /:id` - Get schedule by ID
- `POST /` - Create schedule (Admin only)
- `PUT /:id` - Update schedule (Admin only)
- `DELETE /:id` - Delete schedule (Admin only)
- `PUT /:id/start` - Start trip (Driver only)
- `PUT /:id/complete` - Complete trip (Driver only)
- `PUT /:id/cancel` - Cancel trip (Driver only)
- `PUT /:id/delay` - Update delay (Driver only)
- `PUT /:id/occupancy` - Update occupancy (Driver only)
- `GET /today` - Get today's schedules
- `GET /active` - Get active schedules
- `GET /route/:routeId` - Get schedules by route
- `GET /driver/:driverId` - Get schedules by driver
- `GET /stats/overview` - Get schedule statistics (Admin only)

#### Tracking (`/api/tracking`)
- `GET /live` - Get live bus locations
- `GET /:busId/history` - Get bus location history
- `GET /nearby` - Get nearby buses
- `GET /route/:routeId/progress` - Get route progress
- `GET /bus/:busId/status` - Get bus status
- `PUT /bus/:busId/location` - Update bus location (Driver only)
- `GET /stats` - Get tracking statistics (Admin only)
- `GET /alerts` - Get real-time alerts
- `GET /route/:routeId/eta` - Get route ETA

#### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `GET /:id` - Get notification by ID
- `POST /` - Create notification (Admin only)
- `PUT /:id` - Update notification (Admin only)
- `DELETE /:id` - Delete notification (Admin only)
- `POST /:id/send` - Send notification (Admin only)
- `POST /:id/interact` - Record user interaction
- `GET /stats/overview` - Get notification statistics (Admin only)
- `GET /role/:role` - Get notifications by role (Admin only)
- `GET /scheduled` - Get scheduled notifications (Admin only)
- `GET /expired` - Get expired notifications (Admin only)
- `PUT /:id/read` - Mark notification as read
- `PUT /read-all` - Mark all notifications as read

#### Admin (`/api/admin`)
- `GET /dashboard` - Get dashboard overview (Admin only)
- `GET /metrics` - Get system metrics (Admin only)
- `GET /users` - Get user management data (Admin only)
- `GET /feedback` - Get feedback management data (Admin only)
- `GET /feedback/pending` - Get pending feedback (Admin only)
- `GET /feedback/high-priority` - Get high priority feedback (Admin only)
- `PUT /feedback/:id/respond` - Respond to feedback (Admin only)
- `PUT /feedback/:id/resolve` - Resolve feedback (Admin only)
- `GET /logs` - Get system logs (Admin only)
- `GET /health` - Get system health (Admin only)
- `GET /export/:type` - Export data (Admin only)

## 🔌 Socket.io Events

### Client to Server
- `updateLocation` - Update bus location (Driver only)
- `startRoute` - Start route (Driver only)
- `endRoute` - End route (Driver only)
- `updateSchedule` - Update schedule (Driver only)
- `joinRoute` - Join route tracking room
- `leaveRoute` - Leave route tracking room
- `joinBus` - Join bus tracking room
- `leaveBus` - Leave bus tracking room
- `emergencyAlert` - Send emergency alert (Driver only)
- `sendMessage` - Send chat message
- `typing` - Send typing indicator

### Server to Client
- `busLocationUpdate` - Real-time bus location update
- `routeStarted` - Route started notification
- `routeEnded` - Route ended notification
- `scheduleUpdated` - Schedule update notification
- `emergencyAlert` - Emergency alert notification
- `newNotification` - New notification
- `message` - Chat message
- `userTyping` - User typing indicator
- `userOffline` - User went offline

## 🗄️ Database Models

### User
- Personal information and authentication
- Role-based access (student, staff, driver, admin)
- Preferences and settings

### Bus
- Bus information and specifications
- Real-time tracking data
- Driver assignment

### Route
- Route information and stops
- Operating schedule
- Bus assignments

### Schedule
- Trip scheduling
- Real-time status tracking
- Performance metrics

### Notification
- Notification content and targeting
- Delivery tracking
- User interactions

### Feedback
- User feedback and ratings
- Response and resolution tracking
- Analytics

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet security headers
- File upload validation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📊 Monitoring

- Health check endpoint: `GET /health`
- System metrics: `GET /api/admin/metrics`
- Real-time monitoring with Socket.io

## 🚀 Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB Atlas or production database
   - Set up SSL certificates

2. **Build and Start**
   ```bash
   npm run build
   npm start
   ```

3. **Process Management**
   - Use PM2 for process management
   - Set up monitoring and logging
   - Configure auto-restart

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added real-time tracking
- **v1.2.0** - Enhanced admin dashboard
- **v1.3.0** - Added feedback system

---

**Note**: This is a demo project for educational purposes. In production, ensure proper security measures, error handling, and monitoring are in place.
