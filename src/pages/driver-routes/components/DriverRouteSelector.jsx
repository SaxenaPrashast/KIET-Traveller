import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DriverRouteSelector = ({ selectedRoute, onRouteChange, onExpand, isExpanded }) => {
  const [timeFilter, setTimeFilter] = useState('all');

  const routeOptions = [
    { value: 'route-1', label: 'Route 1 - Main Campus to Hostel Block A' },
    { value: 'route-2', label: 'Route 2 - Main Campus to Hostel Block B' },
    { value: 'route-3', label: 'Route 3 - Main Campus to City Center' },
    { value: 'route-4', label: 'Route 4 - Hostel to Academic Block' },
    { value: 'route-5', label: 'Route 5 - Campus Loop Service' }
  ];

  const timeFilterOptions = [
    { value: 'all', label: 'All Day' },
    { value: 'morning', label: 'Morning (6:00 - 12:00)' },
    { value: 'afternoon', label: 'Afternoon (12:00 - 18:00)' },
    { value: 'evening', label: 'Evening (18:00 - 22:00)' }
  ];

  const currentRouteLabel = routeOptions.find(r => r.value === selectedRoute)?.label || 'Select Route';

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        onClick={onExpand}
        className="w-full justify-between"
      >
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={16} />
          <span className="font-medium">Route Selection</span>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </Button>

      {isExpanded && (
        <div className="p-4 bg-card border border-border rounded-lg animate-in fade-in space-y-4">
          {/* Route Options */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Select Route</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {routeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => onRouteChange(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedRoute === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Time Filter</label>
            <div className="space-y-2">
              {timeFilterOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setTimeFilter(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    timeFilter === option.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted hover:bg-muted/80 text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live Status */}
          <div className="flex items-center justify-end pt-3 border-t border-border">
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live tracking active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverRouteSelector;
