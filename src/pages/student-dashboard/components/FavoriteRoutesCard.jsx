import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FavoriteRoutesCard = () => {
  const navigate = useNavigate();
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);

  useEffect(() => {
    // Simulate fetching favorite routes
    const mockFavoriteRoutes = [
      {
        id: 1,
        name: 'Main Campus - Hostel',
        description: 'Daily commute route',
        buses: ['KIET-01', 'KIET-03'],
        frequency: '15 mins',
        nextBus: '08:30',
        status: 'active',
        isFavorite: true
      },
      {
        id: 2,
        name: 'Campus - Metro Station',
        description: 'Weekend shopping route',
        buses: ['KIET-02'],
        frequency: '30 mins',
        nextBus: '10:15',
        status: 'active',
        isFavorite: true
      },
      {
        id: 3,
        name: 'Hostel - Sports Complex',
        description: 'Evening sports activities',
        buses: ['KIET-04'],
        frequency: '20 mins',
        nextBus: '17:00',
        status: 'active',
        isFavorite: true
      }
    ];

    setFavoriteRoutes(mockFavoriteRoutes);
  }, []);

  const toggleFavorite = (routeId) => {
    setFavoriteRoutes(prev =>
      prev?.map(route =>
        route?.id === routeId
          ? { ...route, isFavorite: !route?.isFavorite }
          : route
      )
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-success';
      case 'inactive': return 'text-error';
      case 'maintenance': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const handleRouteClick = (route) => {
    navigate('/route-preview', { state: { selectedRoute: route } });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-foreground">Favorite Routes</h2>
          <Icon name="Heart" size={16} className="text-error" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/route-preview')}
          iconName="Plus"
          iconSize={14}
        >
          Add Route
        </Button>
      </div>
      <div className="space-y-3">
        {favoriteRoutes?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Heart" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No favorite routes yet</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/route-preview')}
              className="mt-3"
            >
              Browse Routes
            </Button>
          </div>
        ) : (
          favoriteRoutes?.filter(route => route?.isFavorite)?.map((route) => (
            <div
              key={route?.id}
              className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-smooth cursor-pointer"
              onClick={() => handleRouteClick(route)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-foreground">{route?.name}</h3>
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(route?.status) === 'text-success' ? 'bg-success' : 'bg-error'}`} />
                  </div>
                  <p className="text-sm text-muted-foreground">{route?.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    toggleFavorite(route?.id);
                  }}
                  className="flex-shrink-0"
                >
                  <Icon 
                    name={route?.isFavorite ? "Heart" : "Heart"} 
                    size={16} 
                    className={route?.isFavorite ? "text-error fill-current" : "text-muted-foreground"} 
                  />
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-3 text-sm">
                <div className="flex items-center space-x-1">
                  <Icon name="Bus" size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {route?.buses?.length} bus{route?.buses?.length > 1 ? 'es' : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Clock" size={12} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{route?.frequency}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Timer" size={12} className="text-muted-foreground" />
                  <span className="text-foreground font-medium">{route?.nextBus}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {route?.buses?.map((bus, index) => (
                    <span
                      key={bus}
                      className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
                    >
                      {bus}
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      navigate('/live-bus-tracking', { state: { routeId: route?.id } });
                    }}
                    iconName="MapPin"
                    iconSize={12}
                  >
                    Track
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {favoriteRoutes?.filter(route => route?.isFavorite)?.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/route-preview')}
            iconName="Route"
            iconSize={14}
            className="w-full"
          >
            View All Routes
          </Button>
        </div>
      )}
    </div>
  );
};

export default FavoriteRoutesCard;