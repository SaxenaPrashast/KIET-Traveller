# Icon & Image Usage Guide

## Overview

The application uses two main components for visual elements:

1. **AppIcon** (`src/components/AppIcon.jsx`) - For icons using Lucide React
2. **AppImage** (`src/components/AppImage.jsx`) - For images with icon fallback support

---

## AppIcon Component

Uses **Lucide React** icons for consistent, scalable graphics.

### Basic Usage

```jsx
import Icon from 'components/AppIcon';

<Icon name="Bus" size={24} color="currentColor" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | - | Lucide icon name (e.g., "Bus", "MapPin", "Clock") |
| `size` | number | 24 | Icon size in pixels |
| `color` | string | "currentColor" | Icon color |
| `strokeWidth` | number | 2 | Stroke width for outlined icons |
| `className` | string | "" | Additional CSS classes |

### Common Bus & Transport Icons

```jsx
// Bus & Vehicles
<Icon name="Bus" size={24} />              // Bus
<Icon name="Truck" size={24} />            // Truck
<Icon name="Car" size={24} />              // Car
<Icon name="Navigation" size={24} />       // Navigation
<Icon name="MapPin" size={24} />           // Location pin

// Routes & Tracking
<Icon name="Route" size={24} />            // Route
<Icon name="Navigation2" size={24} />      // Direction
<Icon name="Compass" size={24} />          // Direction
<Icon name="Map" size={24} />              // Map
<Icon name="MapPinCheck" size={24} />      // Destination reached

// Schedule & Time
<Icon name="Clock" size={24} />            // Time
<Icon name="Calendar" size={24} />         // Date
<Icon name="AlertCircle" size={24} />      // Alert
<Icon name="CheckCircle" size={24} />      // Confirmed
<Icon name="XCircle" size={24} />          // Cancelled

// Status & Control
<Icon name="CheckCircle" size={24} />      // Active/Complete
<Icon name="AlertCircle" size={24} />      // Warning
<Icon name="Ban" size={24} />              // Disabled
<Icon name="Pause" size={24} />            // Paused
<Icon name="Play" size={24} />             // Playing

// User & Access
<Icon name="Users" size={24} />            // Passengers/Group
<Icon name="User" size={24} />             // Single user
<Icon name="Shield" size={24} />           // Security/Admin
<Icon name="Lock" size={24} />             // Locked
<Icon name="Unlock" size={24} />           // Unlocked

// Communication
<Icon name="Phone" size={24} />            // Call/Contact
<Icon name="MessageSquare" size={24} />    // Message
<Icon name="Bell" size={24} />             // Notification
<Icon name="AlertTriangle" size={24} />    // Alert

// UI Controls
<Icon name="Menu" size={24} />             // Menu
<Icon name="X" size={24} />                // Close
<Icon name="ChevronDown" size={24} />      // Dropdown
<Icon name="ChevronUp" size={24} />        // Collapse
<Icon name="Settings" size={24} />         // Settings
<Icon name="LogOut" size={24} />           // Logout

// Theme
<Icon name="Sun" size={24} />              // Light mode
<Icon name="Moon" size={24} />             // Dark mode
```

### Examples in Components

**Header Navigation:**
```jsx
<Icon name="Bus" size={24} color="white" />        // Logo
<Icon name="Bell" size={20} />                     // Notifications
<Icon name="Settings" size={20} />                 // Admin
<Icon name="Moon" size={20} />                     // Dark mode toggle
```

**Bus Tracking Page:**
```jsx
<Icon name="MapPin" size={16} className="text-primary" />
<Icon name="Users" size={16} />
<Icon name="Clock" size={16} />
<Icon name="Route" size={16} />
```

**Driver Dashboard:**
```jsx
<Icon name="Truck" size={24} className="text-primary" />  // Driver portal indicator
<Icon name="Compass" size={20} />                         // GPS/Navigation
<Icon name="Users" size={16} />                           // Passenger list
<Icon name="Clock" size={16} />                           // Shift timing
```

---

## AppImage Component

Displays images with automatic fallback to React Icons.

### Basic Usage - Image Only

```jsx
import Image from 'components/AppImage';

<Image 
  src="/path/to/image.png" 
  alt="Bus photo"
  className="w-32 h-32"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `src` | string | - | Image URL path |
| `alt` | string | "Image Name" | Alt text for image |
| `className` | string | "" | CSS classes |
| `useIcon` | boolean | false | Force use icon instead of image |
| `iconName` | string | null | Lucide icon name for fallback |
| `iconSize` | number | 24 | Icon size when displayed |
| `iconColor` | string | "currentColor" | Icon color |
| `fallbackIcon` | string | "HelpCircle" | Default icon if iconName not found |

### Usage Examples

**Image with Icon Fallback:**
```jsx
// If image loads, shows image; if fails, shows Bus icon
<Image 
  src="/buses/route-1.jpg"
  alt="Route 1 bus"
  iconName="Bus"
  iconSize={48}
  className="w-24 h-24 rounded-lg"
/>
```

**Force Icon Display:**
```jsx
// Always displays icon, never tries to load image
<Image 
  useIcon={true}
  iconName="Bus"
  iconSize={32}
  iconColor="#2563EB"
  className="text-primary"
/>
```

**With Default Fallback:**
```jsx
// Uses image, falls back to HelpCircle if image fails
<Image 
  src="/images/bus.jpg"
  alt="Bus"
  className="w-20 h-20"
/>
```

**Bus Card Example:**
```jsx
<div className="card p-4">
  <Image 
    src={`/buses/${busId}.jpg`}
    alt={`Bus ${busNumber}`}
    iconName="Bus"
    iconSize={64}
    className="w-24 h-24 mx-auto mb-4"
  />
  <h3>{busNumber}</h3>
  <p>{routeName}</p>
</div>
```

---

## Styling Icons & Images

### With Tailwind Classes

```jsx
// Icon with Tailwind
<Icon 
  name="Bus" 
  size={24}
  className="text-primary hover:text-primary/80 transition-colors"
/>

// Image with Tailwind
<Image 
  src="/image.jpg"
  iconName="Bus"
  className="w-32 h-32 rounded-full border-2 border-primary shadow-lg"
/>
```

### With Colors

```jsx
// Icon color
<Icon name="Bus" size={32} color="#2563EB" />

// Icon with opacity
<Icon 
  name="Bus" 
  size={24}
  className="opacity-50 hover:opacity-100"
/>
```

### Responsive Sizing

```jsx
// Responsive icon size via className
<Icon 
  name="Bus" 
  size={24}
  className="sm:w-6 md:w-8 lg:w-10"
/>

// Responsive image
<Image 
  src="/buses/bus-1.jpg"
  iconName="Bus"
  className="w-16 sm:w-20 md:w-24 lg:w-32 h-auto"
/>
```

---

## Complete Icon Library (Lucide React)

All available Lucide icons can be used with the `name` prop. Here are categories most relevant to bus tracking:

### Navigation & Location
- MapPin, MapPinCheck, Map, Compass, Navigation, Navigation2, Route, Directions

### Vehicles & Transport
- Bus, Truck, Car, AlertTriangle, AlertCircle, CheckCircle

### Time & Schedule
- Clock, Calendar, Watch, Hourglass, Timer

### Status Indicators
- CheckCircle, XCircle, AlertCircle, Pause, Play, Loader

### UI Elements
- Menu, X, ChevronDown, ChevronUp, Settings, Bell, MessageSquare

### User & Access
- Users, User, Shield, Lock, Unlock, LogOut

For complete icon list, visit: https://lucide.dev/

---

## Migration Guide

### From Image Files to Icons

**Before:**
```jsx
<img src="/assets/images/bus.png" alt="Bus" className="w-6 h-6" />
```

**After:**
```jsx
<Icon name="Bus" size={24} className="w-6 h-6" />
```

### From Mixed Approach to Consistent Icons

**Before:**
```jsx
{/* Inconsistent: mixing images and nothing */}
<div className="icon">{bus.type === 'bus' && <img src="..." />}</div>
```

**After:**
```jsx
<Icon 
  name="Bus" 
  size={24}
  className={bus.type === 'bus' ? 'text-primary' : 'text-muted'}
/>
```

---

## Best Practices

1. **Use Icons for UI Elements** - Use Icon component for buttons, navigation, status indicators
2. **Use AppImage for Photos** - Use Image component for actual photographs or product images
3. **Provide Icon Fallbacks** - Always provide `iconName` prop to AppImage for graceful degradation
4. **Consistent Sizing** - Use standard sizes: 16px (small), 20px (medium), 24px (large), 32px (extra large)
5. **Color Consistency** - Use theme colors (primary, success, warning, error) instead of arbitrary colors
6. **Accessibility** - Always provide meaningful alt text for images
7. **Performance** - Icons are lightweight (vector), use them instead of small images

---

## Troubleshooting

### Icon not displaying
- Check icon name spelling (case-sensitive: "Bus" not "bus")
- Verify icon exists in Lucide React library
- Check browser console for warnings

### Image not loading
- Verify image path is correct
- Check file permissions
- Ensure image format is supported (PNG, JPG, etc.)
- AppImage will fallback to icon if image fails

### Size not matching
- Use explicit `size` prop for AppIcon
- Use `iconSize` prop for AppImage
- Combine with Tailwind `w-*` and `h-*` classes for responsive sizing

