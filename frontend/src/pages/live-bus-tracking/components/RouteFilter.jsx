import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RouteFilter = ({ 
  routes, 
  selectedRoutes, 
  onRouteToggle, 
  onClearAll,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getRouteStatusCount = (routeId) => {
    const route = routes?.find(r => r?.id === routeId);
    if (!route) return { active: 0, total: 0 };
    
    return {
      active: route?.buses?.filter(bus => bus?.status !== 'breakdown')?.length,
      total: route?.buses?.length
    };
  };

  const getRouteColor = (routeId) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];
    return colors?.[routeId % colors?.length];
  };

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={16} className="text-muted-foreground" />
          <h3 className="font-medium text-foreground">Route Filter</h3>
          {selectedRoutes?.length > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {selectedRoutes?.length}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {selectedRoutes?.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="lg:hidden"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
        </div>
      </div>
      {/* Route List */}
      <div className={`${isExpanded || window.innerWidth >= 1024 ? 'block' : 'hidden'} lg:block`}>
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          {routes?.map((route) => {
            const isSelected = selectedRoutes?.includes(route?.id);
            const statusCount = getRouteStatusCount(route?.id);
            
            return (
              <div
                key={route?.id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
                onClick={() => onRouteToggle(route?.id)}
              >
                <div className="flex items-center space-x-3">
                  {/* Route Color Indicator */}
                  <div className={`w-3 h-3 rounded-full ${getRouteColor(route?.id)}`}></div>
                  
                  {/* Route Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-foreground">Route {route?.number}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {statusCount?.active}/{statusCount?.total} active
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{route?.name}</p>
                  </div>
                </div>
                {/* Selection Indicator */}
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  isSelected 
                    ? 'border-primary bg-primary' :'border-muted-foreground'
                }`}>
                  {isSelected && (
                    <Icon name="Check" size={12} color="white" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="border-t border-border p-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allRouteIds = routes?.map(r => r?.id);
                allRouteIds?.forEach(id => {
                  if (!selectedRoutes?.includes(id)) {
                    onRouteToggle(id);
                  }
                });
              }}
              iconName="CheckSquare"
              iconPosition="left"
              iconSize={14}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const activeRoutes = routes?.filter(route => 
                  route?.buses?.some(bus => bus?.status !== 'breakdown')
                )?.map(r => r?.id);
                
                activeRoutes?.forEach(id => {
                  if (!selectedRoutes?.includes(id)) {
                    onRouteToggle(id);
                  }
                });
              }}
              iconName="Play"
              iconPosition="left"
              iconSize={14}
            >
              Active Only
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteFilter;