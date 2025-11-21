import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE } from '../../../config/constants';
import { useAuth } from '../../../contexts/AuthContext';

const RouteManagementPanel = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const defaultRoutes = [
    {
      id: 1,
      name: "Route 1 - Main Campus",
      status: "active",
      driver: "Robert Wilson",
      busNumber: "KIET-001",
      totalStops: 8,
      activeStudents: 45,
      lastUpdate: "2025-09-12T17:30:00Z",
      estimatedTime: "35 min",
      currentLocation: "Stop 3 - Library Junction"
    },
    {
      id: 2,
      name: "Route 2 - Hostel Circuit",
      status: "active",
      driver: "Maria Garcia",
      busNumber: "KIET-002",
      totalStops: 6,
      activeStudents: 32,
      lastUpdate: "2025-09-12T17:25:00Z",
      estimatedTime: "28 min",
      currentLocation: "Stop 1 - Main Gate"
    },
    {
      id: 3,
      name: "Route 3 - City Center",
      status: "delayed",
      driver: "James Thompson",
      busNumber: "KIET-003",
      totalStops: 10,
      activeStudents: 58,
      lastUpdate: "2025-09-12T17:20:00Z",
      estimatedTime: "45 min",
      currentLocation: "Stop 5 - Mall Junction"
    },
    {
      id: 4,
      name: "Route 4 - Residential Area",
      status: "maintenance",
      driver: "Lisa Anderson",
      busNumber: "KIET-004",
      totalStops: 7,
      activeStudents: 0,
      lastUpdate: "2025-09-12T14:00:00Z",
      estimatedTime: "N/A",
      currentLocation: "Maintenance Depot"
    }
  ];

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/routes?page=1&limit=50`, { headers });
      if (!res.ok) throw new Error('Failed to fetch routes');
      const data = await res.json();
      setRoutes((data && data.data && data.data.routes) ? data.data.routes : defaultRoutes);
    } catch (err) {
      setRoutes(defaultRoutes);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof refreshSignal !== 'undefined') fetchRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeof refreshSignal !== 'undefined' ? refreshSignal : null]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'delayed':
        return 'bg-warning/10 text-warning';
      case 'maintenance':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'CheckCircle';
      case 'delayed':
        return 'Clock';
      case 'maintenance':
        return 'Wrench';
      default:
        return 'Circle';
    }
  };

  const formatLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Route Management</h3>
          <div className="flex items-center space-x-2">
            <Button variant="outline" iconName="Plus" iconPosition="left" size="sm" onClick={() => onOpenAddRoute && onOpenAddRoute()}>
              Add Route
            </Button>
            <Button variant="default" iconName="Settings" iconPosition="left" size="sm">
              Configure
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid gap-4">
          {routes?.map((route) => (
            <div 
              key={route?.id} 
              className={`p-4 border rounded-lg transition-smooth cursor-pointer ${
                selectedRoute === route?.id 
                  ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/50'
              }`}
              onClick={() => setSelectedRoute(selectedRoute === route?.id ? null : route?.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Icon name="Bus" size={20} className="text-primary" />
                    <div>
                      <h4 className="font-medium text-foreground">{route?.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Driver: {route?.driver} • Bus: {route?.busNumber}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(route?.status)}`}>
                        <Icon name={getStatusIcon(route?.status)} size={12} />
                        <span className="capitalize">{route?.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {formatLastUpdate(route?.lastUpdate)}
                    </p>
                  </div>
                  
                  <Icon 
                    name={selectedRoute === route?.id ? "ChevronUp" : "ChevronDown"} 
                    size={20} 
                    className="text-muted-foreground"
                  />
                </div>
              </div>

              {selectedRoute === route?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Icon name="MapPin" size={20} className="text-primary mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">{route?.totalStops}</p>
                      <p className="text-xs text-muted-foreground">Total Stops</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Icon name="Users" size={20} className="text-success mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">{route?.activeStudents}</p>
                      <p className="text-xs text-muted-foreground">Active Students</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Icon name="Clock" size={20} className="text-warning mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">{route?.estimatedTime}</p>
                      <p className="text-xs text-muted-foreground">Est. Time</p>
                    </div>
                    <div className="text-center p-3 bg-muted/30 rounded-lg">
                      <Icon name="Navigation" size={20} className="text-error mx-auto mb-1" />
                      <p className="text-sm font-medium text-foreground">Live</p>
                      <p className="text-xs text-muted-foreground">Tracking</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-4">
                    <div className="flex items-center space-x-2">
                      <Icon name="MapPin" size={16} className="text-primary" />
                      <span className="text-sm font-medium text-foreground">Current Location:</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{route?.currentLocation}</span>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" iconName="Eye" iconPosition="left">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" iconName="Edit" iconPosition="left">
                      Edit Route
                    </Button>
                    <Button variant="outline" size="sm" iconName="MessageSquare" iconPosition="left">
                      Send Alert
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RouteManagementPanel;