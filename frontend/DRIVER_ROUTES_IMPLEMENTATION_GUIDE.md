# Implementation Guide: Driver-Student Routes Separation

## File Structure

```
src/
├── pages/
│   ├── driver-routes/                    (NEW)
│   │   ├── index.jsx                     (Main driver routes page)
│   │   └── components/
│   │       ├── DriverRouteSelector.jsx   (Route selection component)
│   │       ├── DriverRouteMap.jsx        (Interactive map with sharing indicator)
│   │       └── DriverRouteInfo.jsx       (Route information panel)
│   │
│   ├── driver-dashboard/
│   │   ├── index.jsx                     (MODIFIED - Added navigation button)
│   │   └── components/
│   │       ├── RouteMapDisplay.jsx
│   │       ├── PassengerManifest.jsx
│   │       └── ShiftManagement.jsx
│   │
│   ├── route-preview/                    (Student route browsing)
│   │   ├── index.jsx
│   │   └── components/
│   │       ├── RouteSelector.jsx
│   │       ├── RouteMap.jsx
│   │       ├── AlternativeRoutes.jsx
│   │       └── ScheduleTimeline.jsx
│   │
│   ├── student-dashboard/
│   │   ├── index.jsx
│   │   └── components/
│   │       ├── QuickActionsSection.jsx   (MODIFIED - Updated label)
│   │       └── ... (other components)
│   │
│   └── ... (other pages)
│
├── Routes.jsx                             (MODIFIED - Added driver-routes route)
└── contexts/
    └── AuthContext.jsx                   (Used for role checking)
```

## Component Deep Dive

### 1. DriverRoutes (Main Page) - `src/pages/driver-routes/index.jsx`

**State Management:**
```javascript
const [selectedRoute, setSelectedRoute] = useState('route-1');
const [selectedStop, setSelectedStop] = useState(null);
const [expandedRouteSelection, setExpandedRouteSelection] = useState(false);
const [expandedRouteInfo, setExpandedRouteInfo] = useState(false);
const [shareLocation, setShareLocation] = useState({
  enabled: false,
  passengers: [],
  expiresAt: null
});
```

**Key Functions:**
- `handleToggleShareLocation()` - Toggle location sharing and set 8-hour expiration
- `handleRouteChange()` - Update selected route
- `handleStopClick()` - Handle stop marker clicks

**Location Sharing Logic:**
```javascript
const handleToggleShareLocation = () => {
  setShareLocation(prev => ({
    ...prev,
    enabled: !prev.enabled,
    expiresAt: !prev.enabled ? new Date(Date.now() + 8 * 60 * 60 * 1000) : null
  }));
};
```

**Layout Structure:**
- Header with title and quick actions
- Location sharing status banner (conditional)
- Main content grid:
  - Left: Interactive map (2 columns)
  - Right: Information panels (1 column)

---

### 2. DriverRouteSelector - `src/pages/driver-routes/components/DriverRouteSelector.jsx`

**Props:**
```javascript
{
  selectedRoute,           // Currently selected route ID
  onRouteChange,          // Callback when route is selected
  onExpand,               // Callback to toggle expansion
  isExpanded              // Current expanded state
}
```

**Features:**
- Button-based collapsible component
- Route options with highlighting
- Time filter dropdown
- Live tracking status indicator
- Max height 48 with scroll for routes

**Styling Highlights:**
```javascript
selectedRoute === option.value
  ? 'bg-primary text-primary-foreground'
  : 'bg-muted hover:bg-muted/80 text-foreground'
```

---

### 3. DriverRouteMap - `src/pages/driver-routes/components/DriverRouteMap.jsx`

**Technology Stack:**
- MapLibre GL JS 5.7.1
- OpenStreetMap tiles
- Canvas-based rendering
- RequestAnimationFrame for smooth animations

**Key Features:**

1. **Map Initialization:**
```javascript
map.current = new maplibregl.Map({
  container: mapContainer.current,
  style: 'https://tiles.openstreetmap.org/styles/osm-bright/style.json',
  center: defaultCenter,
  zoom: 14,
  pitch: 20,
  bearing: -20
});
```

2. **Bus Animation System:**
```javascript
const generateMockBuses = () => {
  // Creates 3 buses with:
  // - Random starting progress (0 to 1)
  // - Variable speed (0.012 - 0.018 per frame)
  // - Ping-pong movement (reverses at ends)
  // - Passenger count (10-50)
};

const createBusSVG = (bus) => {
  // Calculates rotation based on direction
  const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;
  // Returns SVG string with rotation applied
};
```

3. **Animation Loop:**
```javascript
const animate = () => {
  busesMRef.current.forEach((bus) => {
    bus.progress += bus.speed;
    // Reverse direction at endpoints
    if (bus.progress >= 1) bus.reverse = !bus.reverse;
    
    // Update marker position
    // Recalculate latitude/longitude
  });
  busAnimationRef.current = requestAnimationFrame(animate);
};
```

**Stop Markers:**
- Numbered 1-4 (primary color background)
- Click handler passes stop data to parent
- Hover effect with scale transform
- Solid white text with border

**Bus Markers:**
- Blue SVG with directional arrow
- Click handler shows popup with info
- Popup displays passengers, location, sharing status
- Smooth movement every 50ms

**Location Sharing Indicator:**
```javascript
{shareLocationEnabled && (
  <div className="absolute top-4 right-4 bg-success/90 ...">
    <Icon name="MapPin" size={16} />
    <span>Sharing Location</span>
  </div>
)}
```

---

### 4. DriverRouteInfo - `src/pages/driver-routes/components/DriverRouteInfo.jsx`

**Route Information Data:**
```javascript
const routeInfo = {
  'route-1': {
    name: 'Route 1 - Main Campus to Hostel Block A',
    distance: '2.5 km',
    duration: '12 minutes',
    totalStops: 4,
    busesOperating: 3,
    startTime: '06:00 AM',
    endTime: '10:00 PM',
    status: 'Active',
    capacity: 50
  },
  // ... other routes
};
```

**Display Sections:**
1. Route Header - Name and status
2. Statistics Grid - Distance, duration, capacity, stops
3. Operating Hours - Start/end times
4. Selected Stop Details - If a stop is clicked
5. Driver Notice - Important alerts

---

## Integration Points

### 1. Authentication & Authorization

**In `Routes.jsx`:**
```javascript
<Route path="/driver-routes" element={
  <ProtectedRoute requiredRole="driver">
    <DriverRoutes />
  </ProtectedRoute>
} />
```

**Result:**
- Only users with `role === 'driver'` can access
- Others redirected to login
- Auth context provides `hasRole()` method

### 2. Navigation Flow

**From Driver Dashboard:**
```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

<Button onClick={() => navigate('/driver-routes')}>
  My Routes & Location Sharing
</Button>
```

**From Student Dashboard:**
```javascript
// Routes remain the same
navigate('/route-preview')  // For students
```

### 3. State Management

**Location Sharing State:**
```javascript
const [shareLocation, setShareLocation] = useState({
  enabled: false,           // Boolean toggle
  passengers: [],           // Will be used for permissions in future
  expiresAt: null          // JavaScript Date object
});
```

**localStorage Integration:**
- Route bookmarks still stored in localStorage
- Location sharing state in component state (not persisted yet)
- Future enhancement: Persist to backend

---

## User Experience Flows

### Driver Using Location Sharing

```
1. Arrives at Driver Routes page (/driver-routes)
2. Sees "Share Location" button in header
3. Clicks button
4. Button changes to "Location Shared" (green)
5. Green banner appears showing:
   - ✓ Location sharing active
   - Expiration time
   - Close button
6. Map shows "Sharing Location" badge
7. Info panel shows what passengers see:
   - Real-time location
   - Speed & direction
   - Next stop & ETA
   - Bus occupancy

8. After 8 hours OR manual disable:
   - Sharing stops
   - Banner disappears
   - Button returns to "Share Location"
   - Map badge removed
```

### Student Browsing Routes (Unchanged)

```
1. Student goes to dashboard
2. Clicks "Browse Routes" in Quick Actions
3. Lands on /route-preview
4. Can see all 5 routes
5. Select route → see alternatives and schedules
6. Click stops on map for details
7. Use "Live Tracking" button for real-time view
8. No location sharing features visible
```

---

## Data Flow Diagram

```
┌─────────────────────┐
│ Driver Dashboard    │
│ "My Routes & Loc"   │
│    Button           │
└──────────┬──────────┘
           │ navigate('/driver-routes')
           │
           ▼
┌─────────────────────┐
│ DriverRoutes Page   │
│ (Protected Route)   │
└──────────┬──────────┘
           │
           ├─► DriverRouteSelector
           │   - Route options
           │   - Time filters
           │
           ├─► DriverRouteMap
           │   - MapLibre GL
           │   - Animated buses
           │   - Stop markers
           │   - Sharing indicator
           │
           └─► DriverRouteInfo
               - Route stats
               - Stop details
               - Driver notes

┌──────────────────────────────┐
│ Student Dashboard            │
│ "Browse Routes" Button        │
└──────────┬───────────────────┘
           │ navigate('/route-preview')
           │
           ▼
┌──────────────────────────────┐
│ RoutePreview Page            │
│ (Open to all)                │
└──────────┬───────────────────┘
           │
           ├─► RouteSelector
           │   - All 5 routes
           │
           ├─► RouteMap
           │   - MapLibre GL
           │   - Animated buses
           │
           ├─► AlternativeRoutes
           │   - Alternative options
           │
           └─► ScheduleTimeline
               - Schedules & times
```

---

## Testing Scenarios

### Test 1: Driver Access
```
✅ Login as driver
✅ See driver dashboard with "My Routes" button
✅ Click button → navigate to /driver-routes
✅ Location sharing button present
✅ Can toggle on/off
✅ Banner appears when enabled
✅ Map shows sharing indicator
```

### Test 2: Student Cannot Access Driver Routes
```
✅ Login as student
✅ Try to access /driver-routes directly
✅ Redirected to login or dashboard
✅ No errors in console
✅ Protected route works correctly
```

### Test 3: Separate Route Browsing
```
✅ Student → Browse Routes → /route-preview
✅ Sees route selector, alternatives, schedules
✅ No location sharing visible
✅ Driver → My Routes → /driver-routes
✅ Sees route selector, info panel, sharing controls
✅ Different component layouts for each
```

### Test 4: Location Sharing Details
```
✅ Enable location sharing
✅ See green banner with time
✅ Info panel shows what passengers see
✅ Disable location sharing
✅ Banner and indicators disappear
✅ All state resets correctly
```

---

## Performance Considerations

1. **Map Rendering:**
   - Uses requestAnimationFrame for smooth 50ms updates
   - Stops animation on route change
   - Cleanup with cancelAnimationFrame

2. **State Updates:**
   - Minimal re-renders with proper dependency arrays
   - Location sharing state toggles efficiently
   - No unnecessary map re-initialization

3. **Memory Management:**
   - Cleanup on component unmount
   - Bus markers properly managed
   - Map instance properly destroyed

---

## Future Enhancements

1. **Real-time Backend Integration:**
   - Replace mock buses with real GPS data
   - Socket.IO for live location streaming
   - Backend stores sharing permissions

2. **Passenger Notifications:**
   - Push notifications when sharing enabled
   - Real-time ETA updates
   - SMS alerts

3. **Advanced Controls:**
   - Selective passenger sharing
   - Time-limited share links
   - Revoke specific passenger access

4. **Analytics:**
   - Track sharing usage
   - Measure passenger engagement
   - Route efficiency metrics

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Cannot access /driver-routes | Not logged in as driver | Check user role in AuthContext |
| Map not loading | mapContainer ref issue | Verify ref attached to container |
| Buses not animating | Animation loop not starting | Check if map is fully loaded |
| Sharing banner not showing | State not updating | Verify handleToggleShareLocation called |
| Icons not showing | Missing Icon component | Ensure AppIcon imported correctly |

