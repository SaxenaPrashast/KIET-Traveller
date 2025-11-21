import React from 'react';
import Icon from '../../../components/AppIcon';

const DriverRouteInfo = ({ selectedRoute, selectedStop }) => {
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
    'route-2': {
      name: 'Route 2 - Main Campus to Hostel Block B',
      distance: '3.1 km',
      duration: '15 minutes',
      totalStops: 4,
      busesOperating: 3,
      startTime: '06:00 AM',
      endTime: '10:00 PM',
      status: 'Active',
      capacity: 50
    },
    'route-3': {
      name: 'Route 3 - Main Campus to City Center',
      distance: '5.8 km',
      duration: '22 minutes',
      totalStops: 4,
      busesOperating: 2,
      startTime: '07:00 AM',
      endTime: '08:00 PM',
      status: 'Active',
      capacity: 45
    },
    'route-4': {
      name: 'Route 4 - Hostel to Academic Block',
      distance: '1.2 km',
      duration: '6 minutes',
      totalStops: 4,
      busesOperating: 4,
      startTime: '06:00 AM',
      endTime: '10:00 PM',
      status: 'Active',
      capacity: 50
    },
    'route-5': {
      name: 'Route 5 - Campus Loop Service',
      distance: '4.3 km',
      duration: '18 minutes',
      totalStops: 4,
      busesOperating: 3,
      startTime: '06:00 AM',
      endTime: '10:00 PM',
      status: 'Active',
      capacity: 50
    }
  };

  const info = routeInfo[selectedRoute];

  return (
    <div className="space-y-4">
      {/* Route Header */}
      <div>
        <h3 className="font-semibold text-foreground mb-2">{info.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full"></div>
          <span className="text-sm text-muted-foreground">{info.status}</span>
        </div>
      </div>

      {/* Route Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="MapPin" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Distance</span>
          </div>
          <p className="font-semibold text-foreground">{info.distance}</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Clock" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Duration</span>
          </div>
          <p className="font-semibold text-foreground">{info.duration}</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Users" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Capacity</span>
          </div>
          <p className="font-semibold text-foreground">{info.capacity} seats</p>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="Navigation" size={14} className="text-primary" />
            <span className="text-xs text-muted-foreground">Stops</span>
          </div>
          <p className="font-semibold text-foreground">{info.totalStops} stops</p>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="p-3 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Clock" size={14} className="text-primary" />
          <span className="text-xs font-medium text-foreground">Operating Hours</span>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>Start: <span className="text-foreground font-medium">{info.startTime}</span></p>
          <p>End: <span className="text-foreground font-medium">{info.endTime}</span></p>
        </div>
      </div>

      {/* Selected Stop Details */}
      {selectedStop && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="MapPin" size={14} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Selected Stop</span>
          </div>
          <p className="text-sm text-foreground font-semibold">{selectedStop.name}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedStop.lat.toFixed(4)}, {selectedStop.lng.toFixed(4)}
          </p>
        </div>
      )}

      {/* Driver Notice */}
      <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="AlertCircle" size={14} className="text-warning mt-0.5 flex-shrink-0" />
          <div className="text-xs text-muted-foreground">
            <p className="font-medium text-warning mb-1">Driver Note</p>
            <p>Check vehicle inspection status before departing. Ensure all passengers are seated.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverRouteInfo;
