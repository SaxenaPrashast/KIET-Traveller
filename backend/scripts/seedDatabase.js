const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Bus = require('../models/Bus');
const Route = require('../models/Route');
const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');
const Feedback = require('../models/Feedback');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kiet_traveller', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Bus.deleteMany({});
    await Route.deleteMany({});
    await Schedule.deleteMany({});
    await Notification.deleteMany({});
    await Feedback.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      email: 'admin@kiet.edu',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      employeeId: 'ADM001',
      designation: 'System Administrator',
      department: 'IT',
      isEmailVerified: true,
      isActive: true
    });

    console.log('👤 Created admin user');

    // Create driver users
    const drivers = await User.create([
      {
        email: 'driver1@kiet.edu',
        password: 'driver123',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        role: 'driver',
        driverLicense: 'DL123456789',
        experience: 5,
        phone: '+91-9876543210',
        isEmailVerified: true,
        isActive: true
      },
      {
        email: 'driver2@kiet.edu',
        password: 'driver123',
        firstName: 'Suresh',
        lastName: 'Singh',
        role: 'driver',
        driverLicense: 'DL987654321',
        experience: 3,
        phone: '+91-9876543211',
        isEmailVerified: true,
        isActive: true
      },
      {
        email: 'driver3@kiet.edu',
        password: 'driver123',
        firstName: 'Amit',
        lastName: 'Sharma',
        role: 'driver',
        driverLicense: 'DL456789123',
        experience: 7,
        phone: '+91-9876543212',
        isEmailVerified: true,
        isActive: true
      }
    ]);

    console.log('👨‍💼 Created driver users');

    // Create student users
    const students = await User.create([
      {
        email: 'student1@kiet.edu',
        password: 'student123',
        firstName: 'Aarav',
        lastName: 'Patel',
        role: 'student',
        studentId: 'STU001',
        department: 'Computer Science',
        year: '3rd',
        hostelBlock: 'Block A',
        isEmailVerified: true,
        isActive: true
      },
      {
        email: 'student2@kiet.edu',
        password: 'student123',
        firstName: 'Priya',
        lastName: 'Sharma',
        role: 'student',
        studentId: 'STU002',
        department: 'Electronics',
        year: '2nd',
        hostelBlock: 'Block B',
        isEmailVerified: true,
        isActive: true
      },
      {
        email: 'student3@kiet.edu',
        password: 'student123',
        firstName: 'Rahul',
        lastName: 'Verma',
        role: 'student',
        studentId: 'STU003',
        department: 'Mechanical',
        year: '4th',
        hostelBlock: 'Block C',
        isEmailVerified: true,
        isActive: true
      }
    ]);

    console.log('🎓 Created student users');

    // Create staff users
    const staff = await User.create([
      {
        email: 'staff1@kiet.edu',
        password: 'staff123',
        firstName: 'Dr. Neha',
        lastName: 'Gupta',
        role: 'staff',
        employeeId: 'STF001',
        designation: 'Professor',
        department: 'Computer Science',
        phone: '+91-9876543213',
        isEmailVerified: true,
        isActive: true
      },
      {
        email: 'staff2@kiet.edu',
        password: 'staff123',
        firstName: 'Prof. Ravi',
        lastName: 'Agarwal',
        role: 'staff',
        employeeId: 'STF002',
        designation: 'Assistant Professor',
        department: 'Electronics',
        phone: '+91-9876543214',
        isEmailVerified: true,
        isActive: true
      }
    ]);

    console.log('👩‍🏫 Created staff users');

    // Create buses
    const buses = await Bus.create([
      {
        busNumber: 'KIET-01',
        registrationNumber: 'UP16AB1234',
        model: 'Tata Starbus',
        manufacturer: 'Tata Motors',
        year: 2022,
        capacity: 45,
        features: ['AC', 'GPS', 'Camera'],
        status: 'active',
        fuelType: 'Diesel',
        assignedDriver: drivers[0]._id,
        isTrackingEnabled: true,
        currentStatus: 'idle',
        currentSpeed: 0,
        currentOccupancy: 0
      },
      {
        busNumber: 'KIET-02',
        registrationNumber: 'UP16CD5678',
        model: 'Ashok Leyland',
        manufacturer: 'Ashok Leyland',
        year: 2021,
        capacity: 40,
        features: ['Non-AC', 'GPS'],
        status: 'active',
        fuelType: 'Diesel',
        assignedDriver: drivers[1]._id,
        isTrackingEnabled: true,
        currentStatus: 'idle',
        currentSpeed: 0,
        currentOccupancy: 0
      },
      {
        busNumber: 'KIET-03',
        registrationNumber: 'UP16EF9012',
        model: 'Mahindra',
        manufacturer: 'Mahindra & Mahindra',
        year: 2023,
        capacity: 50,
        features: ['AC', 'GPS', 'Camera', 'WiFi'],
        status: 'active',
        fuelType: 'Diesel',
        assignedDriver: drivers[2]._id,
        isTrackingEnabled: true,
        currentStatus: 'idle',
        currentSpeed: 0,
        currentOccupancy: 0
      }
    ]);

    console.log('🚌 Created buses');

    // Update drivers with assigned buses
    for (let i = 0; i < drivers.length; i++) {
      drivers[i].assignedBus = buses[i]._id;
      await drivers[i].save();
    }

    // Create routes
    const routes = await Route.create([
      {
        routeNumber: 'R001',
        name: 'Main Campus to Hostel Block',
        description: 'Regular route from main campus to hostel blocks',
        stops: [
          {
            name: 'Main Gate',
            description: 'Main entrance of the campus',
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139]
            },
            address: 'KIET Main Gate, Ghaziabad',
            sequence: 0,
            estimatedTime: 0
          },
          {
            name: 'Academic Block A',
            description: 'Computer Science and IT departments',
            location: {
              type: 'Point',
              coordinates: [77.2095, 28.6145]
            },
            address: 'Academic Block A, KIET',
            sequence: 1,
            estimatedTime: 3
          },
          {
            name: 'Library',
            description: 'Central library building',
            location: {
              type: 'Point',
              coordinates: [77.2100, 28.6150]
            },
            address: 'Central Library, KIET',
            sequence: 2,
            estimatedTime: 5
          },
          {
            name: 'Cafeteria',
            description: 'Student cafeteria',
            location: {
              type: 'Point',
              coordinates: [77.2105, 28.6155]
            },
            address: 'Student Cafeteria, KIET',
            sequence: 3,
            estimatedTime: 8
          },
          {
            name: 'Hostel Block A',
            description: 'Boys hostel block A',
            location: {
              type: 'Point',
              coordinates: [77.2110, 28.6160]
            },
            address: 'Hostel Block A, KIET',
            sequence: 4,
            estimatedTime: 12
          }
        ],
        startStop: null, // Will be set after stops are created
        endStop: null,
        totalDistance: 2.5,
        estimatedDuration: 15,
        isActive: true,
        isCircular: false,
        operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        operatingHours: {
          start: '06:00',
          end: '22:00'
        },
        frequency: 30,
        fare: 0,
        capacity: 45,
        features: ['AC', 'Local'],
        assignedBuses: [buses[0]._id],
        createdBy: adminUser._id
      },
      {
        routeNumber: 'R002',
        name: 'Hostel Block to City Center',
        description: 'Route from hostel blocks to city center',
        stops: [
          {
            name: 'Hostel Block A',
            description: 'Boys hostel block A',
            location: {
              type: 'Point',
              coordinates: [77.2110, 28.6160]
            },
            address: 'Hostel Block A, KIET',
            sequence: 0,
            estimatedTime: 0
          },
          {
            name: 'Sports Complex',
            description: 'Sports and recreation center',
            location: {
              type: 'Point',
              coordinates: [77.2115, 28.6165]
            },
            address: 'Sports Complex, KIET',
            sequence: 1,
            estimatedTime: 5
          },
          {
            name: 'Main Gate',
            description: 'Main entrance of the campus',
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139]
            },
            address: 'KIET Main Gate, Ghaziabad',
            sequence: 2,
            estimatedTime: 10
          },
          {
            name: 'Metro Station',
            description: 'Nearest metro station',
            location: {
              type: 'Point',
              coordinates: [77.2080, 28.6120]
            },
            address: 'Dilshad Garden Metro Station',
            sequence: 3,
            estimatedTime: 20
          },
          {
            name: 'City Center',
            description: 'Main city center area',
            location: {
              type: 'Point',
              coordinates: [77.2070, 28.6100]
            },
            address: 'City Center, Ghaziabad',
            sequence: 4,
            estimatedTime: 35
          }
        ],
        startStop: null,
        endStop: null,
        totalDistance: 8.0,
        estimatedDuration: 40,
        isActive: true,
        isCircular: false,
        operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        operatingHours: {
          start: '07:00',
          end: '21:00'
        },
        frequency: 45,
        fare: 10,
        capacity: 40,
        features: ['Non-AC', 'Express'],
        assignedBuses: [buses[1]._id],
        createdBy: adminUser._id
      },
      {
        routeNumber: 'R003',
        name: 'Campus Circular Route',
        description: 'Circular route around the campus',
        stops: [
          {
            name: 'Main Gate',
            description: 'Main entrance of the campus',
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139]
            },
            address: 'KIET Main Gate, Ghaziabad',
            sequence: 0,
            estimatedTime: 0
          },
          {
            name: 'Academic Block B',
            description: 'Electronics and Mechanical departments',
            location: {
              type: 'Point',
              coordinates: [77.2092, 28.6142]
            },
            address: 'Academic Block B, KIET',
            sequence: 1,
            estimatedTime: 2
          },
          {
            name: 'Library',
            description: 'Central library building',
            location: {
              type: 'Point',
              coordinates: [77.2100, 28.6150]
            },
            address: 'Central Library, KIET',
            sequence: 2,
            estimatedTime: 5
          },
          {
            name: 'Cafeteria',
            description: 'Student cafeteria',
            location: {
              type: 'Point',
              coordinates: [77.2105, 28.6155]
            },
            address: 'Student Cafeteria, KIET',
            sequence: 3,
            estimatedTime: 8
          },
          {
            name: 'Hostel Block B',
            description: 'Girls hostel block B',
            location: {
              type: 'Point',
              coordinates: [77.2112, 28.6162]
            },
            address: 'Hostel Block B, KIET',
            sequence: 4,
            estimatedTime: 12
          },
          {
            name: 'Main Gate',
            description: 'Main entrance of the campus',
            location: {
              type: 'Point',
              coordinates: [77.2090, 28.6139]
            },
            address: 'KIET Main Gate, Ghaziabad',
            sequence: 5,
            estimatedTime: 15
          }
        ],
        startStop: null,
        endStop: null,
        totalDistance: 3.0,
        estimatedDuration: 20,
        isActive: true,
        isCircular: true,
        operatingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        operatingHours: {
          start: '08:00',
          end: '18:00'
        },
        frequency: 20,
        fare: 0,
        capacity: 50,
        features: ['AC', 'Local'],
        assignedBuses: [buses[2]._id],
        createdBy: adminUser._id
      }
    ]);

    console.log('🛣️  Created routes');

    // Create schedules
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const schedules = await Schedule.create([
      {
        route: routes[0]._id,
        bus: buses[0]._id,
        driver: drivers[0]._id,
        date: tomorrow,
        startTime: '08:00',
        endTime: '08:30',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      },
      {
        route: routes[0]._id,
        bus: buses[0]._id,
        driver: drivers[0]._id,
        date: tomorrow,
        startTime: '14:00',
        endTime: '14:30',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      },
      {
        route: routes[1]._id,
        bus: buses[1]._id,
        driver: drivers[1]._id,
        date: tomorrow,
        startTime: '09:00',
        endTime: '09:45',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      },
      {
        route: routes[1]._id,
        bus: buses[1]._id,
        driver: drivers[1]._id,
        date: tomorrow,
        startTime: '17:00',
        endTime: '17:45',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      },
      {
        route: routes[2]._id,
        bus: buses[2]._id,
        driver: drivers[2]._id,
        date: tomorrow,
        startTime: '10:00',
        endTime: '10:20',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      },
      {
        route: routes[2]._id,
        bus: buses[2]._id,
        driver: drivers[2]._id,
        date: tomorrow,
        startTime: '16:00',
        endTime: '16:20',
        status: 'scheduled',
        tripType: 'regular',
        createdBy: adminUser._id
      }
    ]);

    console.log('📅 Created schedules');

    // Create sample notifications
    const notifications = await Notification.create([
      {
        title: 'Welcome to KIET Traveller',
        message: 'Welcome to the KIET Bus Tracking System. Track your buses in real-time!',
        type: 'info',
        priority: 'medium',
        recipients: [...students.map(s => s._id), ...staff.map(s => s._id)],
        channels: ['in_app'],
        status: 'sent',
        createdBy: adminUser._id
      },
      {
        title: 'Route R001 Schedule Update',
        message: 'Route R001 (Main Campus to Hostel Block) will have increased frequency during exam period.',
        type: 'info',
        priority: 'low',
        recipients: [...students.map(s => s._id)],
        targetRoutes: [routes[0]._id],
        channels: ['in_app'],
        status: 'sent',
        createdBy: adminUser._id
      },
      {
        title: 'Bus KIET-02 Maintenance',
        message: 'Bus KIET-02 will be under maintenance tomorrow. Alternative arrangements have been made.',
        type: 'warning',
        priority: 'high',
        recipients: [...students.map(s => s._id), ...staff.map(s => s._id)],
        targetBuses: [buses[1]._id],
        channels: ['in_app', 'email'],
        status: 'sent',
        createdBy: adminUser._id
      }
    ]);

    console.log('🔔 Created notifications');

    // Create sample feedback
    const feedback = await Feedback.create([
      {
        user: students[0]._id,
        type: 'route',
        relatedRoute: routes[0]._id,
        rating: 4,
        title: 'Good service but needs improvement',
        description: 'The bus service is generally good but sometimes the buses are late. The drivers are friendly and helpful.',
        categories: ['punctuality', 'driver_behavior'],
        status: 'pending',
        priority: 'medium',
        isPublic: true
      },
      {
        user: students[1]._id,
        type: 'bus',
        relatedBus: buses[0]._id,
        rating: 5,
        title: 'Excellent AC bus service',
        description: 'KIET-01 provides excellent service with good AC and comfortable seating. Highly recommended!',
        categories: ['comfort', 'cleanliness'],
        status: 'pending',
        priority: 'low',
        isPublic: true
      },
      {
        user: staff[0]._id,
        type: 'general',
        rating: 3,
        title: 'App needs better UI',
        description: 'The mobile app interface could be improved for better user experience. Some features are hard to find.',
        categories: ['app_usability'],
        status: 'under_review',
        priority: 'medium',
        isPublic: false
      }
    ]);

    console.log('💬 Created feedback');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${await User.countDocuments()}`);
    console.log(`🚌 Buses: ${await Bus.countDocuments()}`);
    console.log(`🛣️  Routes: ${await Route.countDocuments()}`);
    console.log(`📅 Schedules: ${await Schedule.countDocuments()}`);
    console.log(`🔔 Notifications: ${await Notification.countDocuments()}`);
    console.log(`💬 Feedback: ${await Feedback.countDocuments()}`);

    console.log('\n🔑 Demo Credentials:');
    console.log('Admin: admin@kiet.edu / admin123');
    console.log('Driver: driver1@kiet.edu / driver123');
    console.log('Student: student1@kiet.edu / student123');
    console.log('Staff: staff1@kiet.edu / staff123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run seeding
seedDatabase();
