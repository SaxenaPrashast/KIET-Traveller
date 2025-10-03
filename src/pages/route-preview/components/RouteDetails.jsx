import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RouteDetails = ({ selectedRoute, onStopSelect, selectedStop }) => {
  const [expandedStop, setExpandedStop] = useState(null);

  const routeInfo = {
    'route-1': {
      name: 'Route 1 - Main Campus to Hostel Block A',
      frequency: '15 minutes',
      duration: '15 minutes',
      distance: '2.5 km',
      operatingHours: '06:00 - 22:00',
      accessibility: true,
      stops: [
        {
          id: 'stop-1',
          name: 'Main Campus Gate',
          time: '08:00',
          delay: 0,
          amenities: ['Shelter', 'Seating', 'WiFi'],
          accessibility: true,
          nextBus: '5 min'
        },
        {
          id: 'stop-2',
          name: 'Academic Block A',
          time: '08:05',
          delay: 2,
          amenities: ['Shelter', 'Digital Display'],
          accessibility: true,
          nextBus: '7 min'
        },
        {
          id: 'stop-3',
          name: 'Library Junction',
          time: '08:10',
          delay: 0,
          amenities: ['Shelter', 'Seating', 'Lighting'],
          accessibility: false,
          nextBus: '10 min'
        },
        {
          id: 'stop-4',
          name: 'Hostel Block A',
          time: '08:15',
          delay: 1,
          amenities: ['Shelter', 'Seating', 'WiFi', 'CCTV'],
          accessibility: true,
          nextBus: '12 min'
        }
      ]
    }
  };

  const currentRoute = routeInfo?.[selectedRoute] || routeInfo?.['route-1'];

  const getDelayStatus = (delay) => {
    if (delay === 0) return { color: 'text-success', bg: 'bg-success/10', text: 'On Time' };
    if (delay <= 2) return { color: 'text-warning', bg: 'bg-warning/10', text: `+${delay} min` };
    return { color: 'text-error', bg: 'bg-error/10', text: `+${delay} min` };
  };

  const toggleStopExpansion = (stopId) => {
    setExpandedStop(expandedStop === stopId ? null : stopId);
  };

  return (
    <div className="space-y-6">
      {/* Route Overview */}
      <div className="bg-card border border-border rounded-lg p-4 shadow-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">{currentRoute?.name}</h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-2 mx-auto">
              <Icon name="Clock" size={20} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Frequency</p>
            <p className="font-semibold text-foreground">{currentRoute?.frequency}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-secondary/10 rounded-lg mb-2 mx-auto">
              <Icon name="Timer" size={20} className="text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="font-semibold text-foreground">{currentRoute?.duration}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-accent/10 rounded-lg mb-2 mx-auto">
              <Icon name="MapPin" size={20} className="text-accent" />
            </div>
            <p className="text-sm text-muted-foreground">Distance</p>
            <p className="font-semibold text-foreground">{currentRoute?.distance}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-success/10 rounded-lg mb-2 mx-auto">
              <Icon name="Calendar" size={20} className="text-success" />
            </div>
            <p className="text-sm text-muted-foreground">Operating</p>
            <p className="font-semibold text-foreground">{currentRoute?.operatingHours}</p>
          </div>
        </div>

        {currentRoute?.accessibility && (
          <div className="mt-4 flex items-center space-x-2 text-sm text-success">
            <Icon name="Accessibility" size={16} />
            <span>Wheelchair accessible route</span>
          </div>
        )}
      </div>
      {/* Stop Details */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Route Stops</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {currentRoute?.stops?.length} stops • Tap for details
          </p>
        </div>

        <div className="divide-y divide-border">
          {currentRoute?.stops?.map((stop, index) => {
            const delayStatus = getDelayStatus(stop?.delay);
            const isExpanded = expandedStop === stop?.id;
            const isSelected = selectedStop?.id === stop?.id;

            return (
              <div
                key={stop?.id}
                className={`p-4 transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{stop?.name}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-muted-foreground font-mono">
                          {stop?.time}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${delayStatus?.bg} ${delayStatus?.color}`}>
                          {delayStatus?.text}
                        </div>
                        <span className="text-sm text-primary font-medium">
                          Next: {stop?.nextBus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {stop?.accessibility && (
                      <Icon name="Accessibility" size={16} className="text-success" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleStopExpansion(stop?.id)}
                    >
                      <Icon 
                        name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                        size={16} 
                      />
                    </Button>
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-4 pl-11 space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Amenities</h5>
                      <div className="flex flex-wrap gap-2">
                        {stop?.amenities?.map((amenity) => (
                          <span
                            key={amenity}
                            className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-md"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStopSelect(stop)}
                        iconName="Bell"
                        iconPosition="left"
                        iconSize={14}
                      >
                        Set Reminder
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Share"
                        iconPosition="left"
                        iconSize={14}
                      >
                        Share Location
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RouteDetails;