const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Bus = require('../models/Bus');
const Schedule = require('../models/Schedule');


const connectedUsers = new Map();
const userSockets = new Map();


const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return next(new Error('Invalid or inactive user'));
    }

    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};

// Socket handler
const socketHandler = (io) => {
  // Apply authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`User ${user.email} connected with socket ID: ${socket.id}`);

    // Store user connection
    connectedUsers.set(socket.id, user);
    if (!userSockets.has(user._id.toString())) {
      userSockets.set(user._id.toString(), new Set());
    }
    userSockets.get(user._id.toString()).add(socket.id);

    // Join user to their role-based room
    socket.join(`role_${user.role}`);
    
    // Join user to their specific user room for direct messages
    socket.join(`user_${user._id}`);

    // Handle bus location updates (for drivers)
    socket.on('updateLocation', async (data) => {
      try {
        if (user.role !== 'driver') {
          socket.emit('error', { message: 'Only drivers can update location' });
          return;
        }

        const { busId, latitude, longitude, speed, occupancy, heading } = data;
        
        if (!busId || !latitude || !longitude) {
          socket.emit('error', { message: 'Bus ID, latitude, and longitude are required' });
          return;
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
          socket.emit('error', { message: 'Bus not found' });
          return;
        }

        // Check if driver is assigned to this bus
        if (user.assignedBus && user.assignedBus.toString() !== busId) {
          socket.emit('error', { message: 'You are not assigned to this bus' });
          return;
        }

        // Update bus location
        await bus.updateLocation(latitude, longitude);
        
        if (speed !== undefined) bus.currentSpeed = speed;
        if (occupancy !== undefined) await bus.updateOccupancy(occupancy);
        if (heading !== undefined) bus.heading = heading;
        
        bus.lastLocationUpdate = new Date();
        await bus.save();

        // Broadcast location update to all connected clients
        io.emit('busLocationUpdate', {
          busId: bus._id,
          busNumber: bus.busNumber,
          location: bus.currentLocation,
          speed: bus.currentSpeed,
          occupancy: bus.currentOccupancy,
          heading: bus.heading,
          timestamp: new Date()
        });

        socket.emit('locationUpdated', { success: true });
      } catch (error) {
        console.error('Error updating location:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    // Handle route start (for drivers)
    socket.on('startRoute', async (data) => {
      try {
        if (user.role !== 'driver') {
          socket.emit('error', { message: 'Only drivers can start routes' });
          return;
        }

        const { busId, routeId } = data;
        
        if (!busId || !routeId) {
          socket.emit('error', { message: 'Bus ID and route ID are required' });
          return;
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
          socket.emit('error', { message: 'Bus not found' });
          return;
        }

        // Check if driver is assigned to this bus
        if (user.assignedBus && user.assignedBus.toString() !== busId) {
          socket.emit('error', { message: 'You are not assigned to this bus' });
          return;
        }

        // Start route
        await bus.startRoute(routeId);
        bus.currentStatus = 'in_transit';
        await bus.save();

        // Broadcast route start
        io.emit('routeStarted', {
          busId: bus._id,
          busNumber: bus.busNumber,
          routeId: routeId,
          driver: {
            id: user._id,
            name: user.fullName
          },
          timestamp: new Date()
        });

        socket.emit('routeStarted', { success: true });
      } catch (error) {
        console.error('Error starting route:', error);
        socket.emit('error', { message: 'Failed to start route' });
      }
    });

    // Handle route end (for drivers)
    socket.on('endRoute', async (data) => {
      try {
        if (user.role !== 'driver') {
          socket.emit('error', { message: 'Only drivers can end routes' });
          return;
        }

        const { busId } = data;
        
        if (!busId) {
          socket.emit('error', { message: 'Bus ID is required' });
          return;
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
          socket.emit('error', { message: 'Bus not found' });
          return;
        }

        // Check if driver is assigned to this bus
        if (user.assignedBus && user.assignedBus.toString() !== busId) {
          socket.emit('error', { message: 'You are not assigned to this bus' });
          return;
        }

        // End route
        await bus.endRoute();

        // Broadcast route end
        io.emit('routeEnded', {
          busId: bus._id,
          busNumber: bus.busNumber,
          driver: {
            id: user._id,
            name: user.fullName
          },
          timestamp: new Date()
        });

        socket.emit('routeEnded', { success: true });
      } catch (error) {
        console.error('Error ending route:', error);
        socket.emit('error', { message: 'Failed to end route' });
      }
    });

    // Handle schedule updates (for drivers)
    socket.on('updateSchedule', async (data) => {
      try {
        if (user.role !== 'driver') {
          socket.emit('error', { message: 'Only drivers can update schedules' });
          return;
        }

        const { scheduleId, action, data: updateData } = data;
        
        if (!scheduleId || !action) {
          socket.emit('error', { message: 'Schedule ID and action are required' });
          return;
        }

        const schedule = await Schedule.findById(scheduleId);
        if (!schedule) {
          socket.emit('error', { message: 'Schedule not found' });
          return;
        }

        // Check if driver is assigned to this schedule
        if (schedule.driver.toString() !== user._id.toString()) {
          socket.emit('error', { message: 'You are not assigned to this schedule' });
          return;
        }

        let result;
        switch (action) {
          case 'start':
            result = await schedule.startTrip();
            break;
          case 'complete':
            result = await schedule.completeTrip();
            break;
          case 'cancel':
            result = await schedule.cancelTrip(updateData?.reason);
            break;
          case 'delay':
            result = await schedule.updateDelay(updateData?.delayMinutes, updateData?.reason);
            break;
          case 'occupancy':
            result = await schedule.updateOccupancy(updateData?.occupancy);
            break;
          default:
            socket.emit('error', { message: 'Invalid action' });
            return;
        }

        // Broadcast schedule update
        io.emit('scheduleUpdated', {
          scheduleId: schedule._id,
          action,
          data: updateData,
          driver: {
            id: user._id,
            name: user.fullName
          },
          timestamp: new Date()
        });

        socket.emit('scheduleUpdated', { success: true, result });
      } catch (error) {
        console.error('Error updating schedule:', error);
        socket.emit('error', { message: 'Failed to update schedule' });
      }
    });

    // Handle join room for specific route tracking
    socket.on('joinRoute', (routeId) => {
      socket.join(`route_${routeId}`);
      socket.emit('joinedRoute', { routeId });
    });

    // Handle leave room for specific route tracking
    socket.on('leaveRoute', (routeId) => {
      socket.leave(`route_${routeId}`);
      socket.emit('leftRoute', { routeId });
    });

    // Handle join room for specific bus tracking
    socket.on('joinBus', (busId) => {
      socket.join(`bus_${busId}`);
      socket.emit('joinedBus', { busId });
    });

    // Handle leave room for specific bus tracking
    socket.on('leaveBus', (busId) => {
      socket.leave(`bus_${busId}`);
      socket.emit('leftBus', { busId });
    });

    // Handle emergency alert (for drivers)
    socket.on('emergencyAlert', async (data) => {
      try {
        if (user.role !== 'driver') {
          socket.emit('error', { message: 'Only drivers can send emergency alerts' });
          return;
        }

        const { busId, type, message, location } = data;
        
        if (!busId || !type) {
          socket.emit('error', { message: 'Bus ID and alert type are required' });
          return;
        }

        const bus = await Bus.findById(busId);
        if (!bus) {
          socket.emit('error', { message: 'Bus not found' });
          return;
        }

        // Broadcast emergency alert to admins and relevant staff
        io.to('role_admin').to('role_staff').emit('emergencyAlert', {
          busId: bus._id,
          busNumber: bus.busNumber,
          driver: {
            id: user._id,
            name: user.fullName,
            phone: user.phone
          },
          type,
          message,
          location: location || bus.currentLocation,
          timestamp: new Date()
        });

        socket.emit('emergencyAlertSent', { success: true });
      } catch (error) {
        console.error('Error sending emergency alert:', error);
        socket.emit('error', { message: 'Failed to send emergency alert' });
      }
    });

    // Handle chat messages (for coordination)
    socket.on('sendMessage', (data) => {
      const { room, message, type = 'text' } = data;
      
      if (!room || !message) {
        socket.emit('error', { message: 'Room and message are required' });
        return;
      }

      // Broadcast message to room
      io.to(room).emit('message', {
        from: {
          id: user._id,
          name: user.fullName,
          role: user.role
        },
        message,
        type,
        timestamp: new Date()
      });
    });

    // Handle typing indicators
    socket.on('typing', (data) => {
      const { room, isTyping } = data;
      socket.to(room).emit('userTyping', {
        user: {
          id: user._id,
          name: user.fullName
        },
        isTyping,
        timestamp: new Date()
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User ${user.email} disconnected`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.id);
      
      // Remove socket from user's socket set
      const userSocketSet = userSockets.get(user._id.toString());
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(user._id.toString());
        }
      }

      // Notify others that user went offline
      socket.broadcast.emit('userOffline', {
        userId: user._id,
        name: user.fullName,
        role: user.role,
        timestamp: new Date()
      });
    });
  });

  // Broadcast functions for external use
  const broadcastToRole = (role, event, data) => {
    io.to(`role_${role}`).emit(event, data);
  };

  const broadcastToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };

  const broadcastToRoute = (routeId, event, data) => {
    io.to(`route_${routeId}`).emit(event, data);
  };

  const broadcastToBus = (busId, event, data) => {
    io.to(`bus_${busId}`).emit(event, data);
  };

  const broadcastToAll = (event, data) => {
    io.emit(event, data);
  };

  // Return broadcast functions for use in routes
  return {
    broadcastToRole,
    broadcastToUser,
    broadcastToRoute,
    broadcastToBus,
    broadcastToAll,
    getConnectedUsers: () => connectedUsers,
    getUserSockets: () => userSockets
  };
};

module.exports = socketHandler;
