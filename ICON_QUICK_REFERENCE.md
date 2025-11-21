# Quick Icon Reference - Bus Tracking App

## Most Used Icons

### Transportation
```jsx
<Icon name="Bus" size={24} />              // Primary vehicle icon
<Icon name="Truck" size={24} />            // Driver/admin view
<Icon name="Car" size={24} />              // Alternative transport
<Icon name="Navigation" size={24} />       // GPS/Tracking
```

### Location & Routing
```jsx
<Icon name="MapPin" size={24} />           // Stop/Destination location
<Icon name="Route" size={24} />            // Route path/planning
<Icon name="Map" size={24} />              // Full map view
<Icon name="Compass" size={24} />          // Direction/Heading
```

### Status & Indicators
```jsx
<Icon name="CheckCircle" size={24} />      // Arrived/Completed
<Icon name="AlertCircle" size={24} />      // Warning/Attention
<Icon name="Pause" size={24} />            // Delayed/Stopped
<Icon name="Play" size={24} />             // In progress/Active
```

### Time & Schedule
```jsx
<Icon name="Clock" size={24} />            // ETA/Time remaining
<Icon name="Calendar" size={24} />         // Schedule/Date
<Icon name="AlertTriangle" size={24} />    // Late/Delay alert
```

### User & Access
```jsx
<Icon name="Users" size={24} />            // Passengers/Occupancy
<Icon name="User" size={24} />             // Single user/Driver
<Icon name="Shield" size={24} />           // Admin/Security
```

### Navigation & UI
```jsx
<Icon name="Bell" size={24} />             // Notifications
<Icon name="Settings" size={24} />         // Configuration
<Icon name="Menu" size={24} />             // Menu toggle
<Icon name="X" size={24} />                // Close/Exit
<Icon name="ChevronDown" size={24} />      // Expand menu
<Icon name="ChevronUp" size={24} />        // Collapse menu
```

### Theme
```jsx
<Icon name="Sun" size={24} />              // Light mode
<Icon name="Moon" size={24} />             // Dark mode
```

---

## Quick Examples

### Bus Card
```jsx
<div className="card p-4">
  <div className="flex items-center space-x-2">
    <Icon name="Bus" size={32} className="text-primary" />
    <div>
      <h3>Route 3</h3>
      <p className="text-sm text-muted-foreground">Main Campus - Hostel</p>
    </div>
  </div>
  
  <div className="mt-4 space-y-2">
    <div className="flex items-center space-x-2 text-sm">
      <Icon name="MapPin" size={16} className="text-primary" />
      <span>Near Academic Block A</span>
    </div>
    
    <div className="flex items-center space-x-2 text-sm">
      <Icon name="Clock" size={16} className="text-warning" />
      <span>ETA: 5 mins</span>
    </div>
    
    <div className="flex items-center space-x-2 text-sm">
      <Icon name="Users" size={16} className="text-success" />
      <span>32/45 passengers</span>
    </div>
  </div>
</div>
```

### Status Indicator
```jsx
<div className="flex items-center space-x-2">
  <Icon 
    name={status === 'arrived' ? 'CheckCircle' : 'AlertCircle'} 
    size={20}
    className={status === 'arrived' ? 'text-success' : 'text-warning'}
  />
  <span className="font-medium">
    {status === 'arrived' ? 'Bus Arrived' : 'Running Late'}
  </span>
</div>
```

### Header with Icons
```jsx
<header className="flex items-center justify-between p-4">
  <div className="flex items-center space-x-2">
    <Icon name="Bus" size={28} color="white" />
    <span className="text-white font-bold">KIET Traveller</span>
  </div>
  
  <div className="flex items-center space-x-4">
    <button className="relative">
      <Icon name="Bell" size={20} className="text-white" />
      <span className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        3
      </span>
    </button>
    
    <button onClick={toggleDarkMode}>
      <Icon name={isDark ? 'Sun' : 'Moon'} size={20} className="text-white" />
    </button>
  </div>
</header>
```

---

## AppImage with Bus Icons

### Display bus image with icon fallback
```jsx
<Image 
  src={`/buses/${busId}.jpg`}
  alt={`Bus ${busNumber}`}
  iconName="Bus"
  iconSize={64}
  className="w-32 h-32 rounded-lg border-2 border-primary"
/>
```

### Always show icon (for bus types)
```jsx
<Image 
  useIcon={true}
  iconName="Bus"
  iconSize={48}
  iconColor="#2563EB"
  className="rounded-full bg-primary/10 p-4"
/>
```

---

## Color Usage with Icons

```jsx
// With theme colors
<Icon name="Bus" size={24} className="text-primary" />           // Blue
<Icon name="Bus" size={24} className="text-success" />           // Green
<Icon name="Bus" size={24} className="text-warning" />           // Amber
<Icon name="Bus" size={24} className="text-error" />             // Red
<Icon name="Bus" size={24} className="text-muted-foreground" />  // Gray

// With opacity
<Icon name="Bus" size={24} className="text-primary opacity-50" />

// With hover effect
<Icon name="Bus" size={24} className="text-primary hover:text-primary/80 transition-colors cursor-pointer" />
```

---

## Size Guidelines

| Use Case | Size | Prop |
|----------|------|------|
| Navigation buttons | 16px | `size={16}` |
| Card icons | 20-24px | `size={20}` or `size={24}` |
| Header/Logo | 24-28px | `size={24}` or `size={28}` |
| Large displays | 32-48px | `size={32}` or `size={48}` |
| Badges/Status | 12-16px | `size={12}` or `size={16}` |

---

For complete icon list, visit:
- https://lucide.dev/
- Search icons by category or name
