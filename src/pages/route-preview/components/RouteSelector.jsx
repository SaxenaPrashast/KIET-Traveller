import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const RouteSelector = ({ selectedRoute, onRouteChange, onBookmarkToggle, isBookmarked }) => {
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

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Route Selection</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBookmarkToggle}
          className={isBookmarked ? 'text-warning' : 'text-muted-foreground'}
        >
          <Icon name={isBookmarked ? 'Star' : 'Star'} size={20} />
        </Button>
      </div>

      <div className="space-y-4">
        <Select
          label="Select Route"
          options={routeOptions}
          value={selectedRoute}
          onChange={onRouteChange}
          placeholder="Choose a bus route"
          searchable
        />

        <Select
          label="Time Filter"
          options={timeFilterOptions}
          value={timeFilter}
          onChange={setTimeFilter}
          placeholder="Filter by time"
        />

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Last updated: 17:44</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span>Live data</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSelector;