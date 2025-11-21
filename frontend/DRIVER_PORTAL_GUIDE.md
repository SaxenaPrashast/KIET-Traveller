# Driver Portal - Quick Start Guide

## Overview
The driver portal is a dedicated interface for bus drivers to manage routes, track passengers, and report incidents in real-time.

## Features

### 1. **Route Management**
- **Real-Time Map Display**: Live view of current route with stops and passenger locations
- **GPS Tracking**: Continuous location sharing with students and admins
- **Stop Navigation**: Sequential stop management with ETAs and passenger pickup/dropoff

### 2. **Driver Controls**
- **GPS Sharing Toggle**: Enable/disable real-time location sharing
- **Passenger Counter**: Track current occupancy and manage boarding
- **Online Status**: Show driver availability to the system
- **Quick Actions**:
  - Report Delay
  - Emergency Alert
  - Vehicle Issue Report
  - Contact Control Center

### 3. **Passenger Manifest**
- **Real-Time List**: Current and upcoming passengers
- **Status Tracking**: Onboard, confirmed, waiting, or completed
- **Filter by Stop**: Organize passengers by stops
- **Direct Contact**: Quick call functionality for passengers
- **Boarding Actions**: Mark passengers as boarded or dropped off

### 4. **Route Status Updates**
- **Quick Status Options**:
  - On Schedule
  - 5 Min Delay
  - Major Delay (custom duration)
  - Vehicle Issue Report
- **Emergency Controls**:
  - Emergency Stop Button
  - Direct Call to Control Center
  - Emergency Chat

### 5. **Shift Management**
- **Shift Timing**: Scheduled vs. actual duration tracking
- **Break Management**: Start/end breaks with time tracking
- **Vehicle Inspection**: Pre-trip checklist (brakes, lights, tires, fuel, doors, seats)
- **Completion Report**: Generate inspection reports

## Access & Navigation

### Route
```
/driver-dashboard
```

### Authentication
- Requires login with **driver** role
- Protected route - accessible only after authentication

### Header Integration
The main header shows:
- Welcome message with driver name
- Driver Portal link (visible only to drivers)
- Live route status indicator
- Quick access to other features

## Component Structure

```
src/pages/driver-dashboard/
├── index.jsx                    # Main dashboard container
├── components/
│   ├── RouteMapDisplay.jsx     # Live route map with stops
│   ├── DriverControlPanel.jsx  # Control panel with quick actions
│   ├── PassengerManifest.jsx   # Passenger list and management
│   ├── RouteStatusControls.jsx # Status update interface
│   └── ShiftManagement.jsx     # Shift timing and inspection
```

## Key Data Structures

### Driver Session
```javascript
{
  driverId: "DRV001",
  driverName: "Rajesh Kumar",
  vehicleNumber: "UP 16 AB 1234",
  currentRoute: "Route 3 - Main Campus",
  shiftStart: "08:00",
  shiftEnd: "12:00",
  status: "active" | "break" | "ended"
}
```

### Route Data
```javascript
{
  routeId: "route-3",
  name: "Route 3 - Main Campus",
  stops: [
    {
      id: "stop-1",
      name: "Main Gate",
      coordinates: [77.4977, 28.7520],
      eta: "09:15",
      status: "completed" | "current" | "upcoming"
    }
  ],
  passengers: [
    {
      id: "p1",
      name: "Rahul Sharma",
      stop: "Library Block",
      type: "pickup" | "dropoff"
    }
  ]
}
```

### Passenger Status Values
- **Confirmed**: Passenger booked and waiting
- **Onboard**: Currently on the bus
- **Waiting**: At stop waiting for bus
- **Completed**: Trip finished

## Testing the Driver Portal

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Start Frontend
```bash
npm start
# or
npm run dev
```

### 3. Login as Driver
- Go to http://localhost:5173/login (or your Vite port)
- Use driver credentials:
  - Email: driver@example.com
  - Password: (check database or backend env)
- You'll be redirected to student dashboard
- Click "Driver Portal" in header to access driver dashboard

### 4. Test Features
- [ ] Map displays current location
- [ ] GPS toggle works
- [ ] Passenger list shows correctly
- [ ] Can report delay
- [ ] Can mark passengers as boarded
- [ ] Shift timer updates
- [ ] Status updates send properly

## Backend Integration

### API Endpoints Used
- `GET /api/tracking/live` - Get live bus locations
- `GET /api/tracking/:busId/history` - Get location history
- `GET /api/schedules/today` - Get today's schedules
- `PUT /api/buses/:busId/location` - Update bus location
- `PUT /api/schedules/:scheduleId/status` - Update schedule status

### Socket.IO Events
- `driver-location-update` - Real-time location broadcast
- `route-status-changed` - Route status notifications
- `passenger-update` - Passenger boarding/dropoff updates
- `emergency-alert` - Emergency event broadcast

## UI/UX Highlights

### Responsive Design
- Desktop: 3-column layout (map + controls + passengers/shift)
- Tablet: 2-column responsive grid
- Mobile: Single column with bottom action panel

### Real-Time Indicators
- Green pulsing dot: Active GPS
- Status badges: Route status at a glance
- Progress bars: Shift duration and inspection completion

### Accessibility
- High contrast status colors
- Clear labeling for all controls
- Keyboard navigation support
- Touch-friendly buttons for mobile

## Troubleshooting

### Driver Portal Not Showing
**Issue**: Can't see "Driver Portal" in header
- **Solution**: Ensure you're logged in as a driver. Check user role in database.

### Map Not Loading
**Issue**: Blank map area
- **Solution**: Check internet connection, MapLibre GL CSS is loaded, coordinates are valid

### Passengers Not Showing
**Issue**: Empty passenger list
- **Solution**: Ensure route is assigned and has passengers. Check backend API response.

### Location Not Updating
**Issue**: GPS coordinates stuck
- **Solution**: Verify GPS toggle is ON, location permissions granted, backend tracking service running

## Future Enhancements

- [ ] Real-time map with actual bus icon
- [ ] Voice notifications for pickups/dropoffs
- [ ] Fuel level monitoring
- [ ] Route deviation alerts
- [ ] Passenger communication chat
- [ ] Weather and traffic integration
- [ ] Monthly performance analytics
- [ ] Mobile app version

## Performance Tips

- **Minimize Tab Switches**: Keep driver portal in focus for best real-time updates
- **Location Updates**: Default 5-second interval - adjust in RouteMapDisplay if needed
- **Passenger List**: Scrolls up to 5 passengers visible, scroll for more
- **Battery**: GPS sharing drains battery - consider disabling when parked

## Support

For issues or questions:
1. Check backend logs: `backend/server.js` output
2. Check browser console: Browser DevTools → Console
3. Verify MongoDB connection: Should show "✅ Connected to MongoDB"
4. Verify API endpoints: Test with curl or Postman

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0
**Status**: Minimal and Working ✓
