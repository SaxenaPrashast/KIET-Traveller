import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AlternativeRoutes = ({ currentRoute, onRouteSelect }) => {
  const [showAll, setShowAll] = useState(false);

  const alternativeRoutes = [
    {
      id: 'alt-route-1',
      name: 'Express Route 1A',
      duration: '12 minutes',
      stops: 3,
      frequency: '20 minutes',
      nextDeparture: '08:25',
      savings: '3 min faster',
      type: 'express',
      crowdLevel: 'low'
    },
    {
      id: 'alt-route-2',
      name: 'Shuttle Service 2B',
      duration: '18 minutes',
      stops: 6,
      frequency: '10 minutes',
      nextDeparture: '08:22',
      savings: 'More frequent',
      type: 'regular',
      crowdLevel: 'medium'
    },
    {
      id: 'alt-route-3',
      name: 'Night Service 3C',
      duration: '20 minutes',
      stops: 5,
      frequency: '30 minutes',
      nextDeparture: '20:30',
      savings: 'Late hours',
      type: 'night',
      crowdLevel: 'low'
    }
  ];

  const getCrowdLevelConfig = (level) => {
    switch (level) {
      case 'low':
        return { color: 'text-success', bg: 'bg-success/10', text: 'Low crowd' };
      case 'medium':
        return { color: 'text-warning', bg: 'bg-warning/10', text: 'Medium crowd' };
      case 'high':
        return { color: 'text-error', bg: 'bg-error/10', text: 'High crowd' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', text: 'Unknown' };
    }
  };

  const getRouteTypeIcon = (type) => {
    switch (type) {
      case 'express':
        return 'Zap';
      case 'night':
        return 'Moon';
      default:
        return 'Bus';
    }
  };

  const displayedRoutes = showAll ? alternativeRoutes : alternativeRoutes?.slice(0, 2);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Alternative Routes</h3>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Icon name="Route" size={16} />
            <span>{alternativeRoutes?.length} options</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Find faster or more convenient routes to your destination
        </p>
      </div>
      <div className="divide-y divide-border">
        {displayedRoutes?.map((route) => {
          const crowdConfig = getCrowdLevelConfig(route?.crowdLevel);
          
          return (
            <div key={route?.id} className="p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mt-1">
                    <Icon name={getRouteTypeIcon(route?.type)} size={20} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-foreground">{route?.name}</h4>
                      {route?.type === 'express' && (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
                          Express
                        </span>
                      )}
                      {route?.type === 'night' && (
                        <span className="px-2 py-0.5 bg-accent/10 text-accent text-xs rounded-full font-medium">
                          Night
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Icon name="Clock" size={14} />
                        <span>{route?.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="MapPin" size={14} />
                        <span>{route?.stops} stops</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Repeat" size={14} />
                        <span>Every {route?.frequency}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Timer" size={14} />
                        <span>Next: {route?.nextDeparture}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-success">
                          {route?.savings}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${crowdConfig?.bg} ${crowdConfig?.color}`}>
                          {crowdConfig?.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRouteSelect(route?.id)}
                  className="ml-4"
                >
                  Select
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {alternativeRoutes?.length > 2 && (
        <div className="p-4 border-t border-border">
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            iconName={showAll ? "ChevronUp" : "ChevronDown"}
            iconPosition="right"
            iconSize={16}
            className="w-full"
          >
            {showAll ? 'Show Less' : `Show ${alternativeRoutes?.length - 2} More Routes`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default AlternativeRoutes;