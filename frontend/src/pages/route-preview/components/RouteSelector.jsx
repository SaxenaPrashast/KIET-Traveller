import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE } from '../../../config/constants';
import { useAuth } from '../../../contexts/AuthContext';

const RouteSelector = ({ selectedRoute, onRouteChange, onBookmarkToggle, isBookmarked, onExpand, isExpanded }) => {
  const [timeFilter, setTimeFilter] = useState('all');

  const [routeOptions, setRouteOptions] = useState([]);
  const { token } = useAuth();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/routes?page=1&limit=100`, { headers });
        if (!res.ok) throw new Error('Failed to fetch routes');
        const data = await res.json();
        const options = (data?.data?.routes || []).map(r => ({ value: r._id, label: `${r.routeNumber || ''} ${r.name}`.trim() }));
        setRouteOptions(options);
      } catch (err) {
        // fallback to empty; UI will show nothing
        setRouteOptions([]);
      }
    };

    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              {routeOptions.length === 0 && (
                <div className="text-sm text-muted-foreground">No routes available</div>
              )}
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

          {/* Bookmark Button & Live Status */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBookmarkToggle}
              className={isBookmarked ? 'text-warning' : 'text-muted-foreground'}
            >
              <Icon name="Star" size={16} />
              <span className="ml-2">{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </Button>

            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteSelector;