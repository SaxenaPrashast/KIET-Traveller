#!/usr/bin/env node

/**
 * Driver Portal Quick Test
 * Validates driver portal setup and basic functionality
 */

const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: 'Driver Dashboard Main File',
    path: 'src/pages/driver-dashboard/index.jsx',
    validate: (content) => content.includes('DriverDashboard') && content.includes('ProtectedRoute')
  },
  {
    name: 'Route Map Component',
    path: 'src/pages/driver-dashboard/components/RouteMapDisplay.jsx',
    validate: (content) => content.includes('RouteMapDisplay') && content.includes('useState')
  },
  {
    name: 'Driver Control Panel',
    path: 'src/pages/driver-dashboard/components/DriverControlPanel.jsx',
    validate: (content) => content.includes('DriverControlPanel') && content.includes('gpsEnabled')
  },
  {
    name: 'Passenger Manifest',
    path: 'src/pages/driver-dashboard/components/PassengerManifest.jsx',
    validate: (content) => content.includes('PassengerManifest') && content.includes('mockPassengers')
  },
  {
    name: 'Route Status Controls',
    path: 'src/pages/driver-dashboard/components/RouteStatusControls.jsx',
    validate: (content) => content.includes('RouteStatusControls') && content.includes('handleStatusUpdate')
  },
  {
    name: 'Shift Management',
    path: 'src/pages/driver-dashboard/components/ShiftManagement.jsx',
    validate: (content) => content.includes('ShiftManagement') && content.includes('getShiftDuration')
  },
  {
    name: 'Routes Configuration',
    path: 'src/Routes.jsx',
    validate: (content) => content.includes('/driver-dashboard') && content.includes('requiredRole="driver"')
  },
  {
    name: 'Header Component',
    path: 'src/components/ui/Header.jsx',
    validate: (content) => content.includes('Driver Portal') && content.includes('user?.role === \'driver\'')
  },
  {
    name: 'Backend Tracking Routes',
    path: 'backend/routes/tracking.js',
    validate: (content) => content.includes('/live') && content.includes('Bus.find')
  }
];

console.log('\n🚌 Driver Portal - Component Verification\n');
console.log('=' .repeat(60));

let passedChecks = 0;
let failedChecks = 0;

checks.forEach((check) => {
  try {
    const filePath = path.join(__dirname, check.path);
    if (!fs.existsSync(filePath)) {
      console.log(`❌ ${check.name}`);
      console.log(`   └─ File not found: ${check.path}`);
      failedChecks++;
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    if (check.validate(content)) {
      console.log(`✅ ${check.name}`);
      passedChecks++;
    } else {
      console.log(`⚠️  ${check.name}`);
      console.log(`   └─ Content validation failed`);
      failedChecks++;
    }
  } catch (error) {
    console.log(`❌ ${check.name}`);
    console.log(`   └─ Error: ${error.message}`);
    failedChecks++;
  }
});

console.log('=' .repeat(60));
console.log(`\nResults: ${passedChecks} passed, ${failedChecks} failed`);

if (failedChecks === 0) {
  console.log('\n✨ All checks passed! Driver portal is ready.\n');
  console.log('Next steps:');
  console.log('1. Start backend: cd backend && npm start');
  console.log('2. Start frontend: npm start');
  console.log('3. Login as driver role user');
  console.log('4. Access /driver-dashboard\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review the issues above.\n');
  process.exit(1);
}
