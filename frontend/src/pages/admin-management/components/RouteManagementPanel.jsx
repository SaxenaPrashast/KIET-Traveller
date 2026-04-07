import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_BASE } from '../../../config/constants';
import { useAuth } from '../../../contexts/AuthContext';
import AddRouteModal from "./AddRouteModal";
import RouteStopsModal from "./RouteStopsModal";
import AssignBusModal from './AssignBusModal';

const RouteManagementPanel = ({ refreshSignal, onOpenAddRoute }) => {

  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddRoute, setShowAddRoute] = useState(false);
  const [showStopsModal, setShowStopsModal] = useState(false);
  const [activeRouteId, setActiveRouteId] = useState(null);
  const [showAssignBus,setShowAssignBus] = useState(false);
  const [selectedRouteId,setSelectedRouteId] = useState(null);

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
      lastUpdate: new Date().toISOString(),
      estimatedTime: "35 min",
      currentLocation: "Stop 3 - Library Junction"
    }
  ];

  const fetchRoutes = async () => {

    setLoading(true);

    try {

      const res = await fetch(`${API_BASE}/routes?page=1&limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch routes");

      const data = await res.json();

      if (data.success) {

        const mappedRoutes = data.data.routes.map(route => ({
          id: route._id,
          name: `${route.routeNumber || ''} - ${route.name || ''}`,
          status: route.isActive ? "active" : "maintenance",
          driver: "Not Assigned",
          busNumber: route.assignedBuses?.[0]?.busNumber || "Not Assigned",
          totalStops: route.stops ? route.stops.length : 0,
          activeStudents: route.activeStudentsCount ?? 0,
          lastUpdate: route.updatedAt || new Date().toISOString(),
          estimatedTime: route.estimatedTime ? `${route.estimatedTime} min` : "N/A",
          currentLocation: "Unknown"
        }));

        setRoutes(mappedRoutes);

      } else {
        setRoutes(defaultRoutes);
      }

    } catch (err) {

      console.error("Route fetch error:", err);
      setRoutes(defaultRoutes);

    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (refreshSignal !== undefined) {
      fetchRoutes();
    }
  }, [refreshSignal]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-success/10 text-success';
      case 'delayed': return 'bg-warning/10 text-warning';
      case 'maintenance': return 'bg-error/10 text-error';
      default: return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'delayed': return 'Clock';
      case 'maintenance': return 'Wrench';
      default: return 'Circle';
    }
  };

  const formatLastUpdate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">

      <div className="p-6 border-b border-border">

        <div className="flex items-center justify-between mb-4">

          <h3 className="text-lg font-semibold text-foreground">
            Route Management
          </h3>

          <div className="flex items-center space-x-2">

            <Button
              variant="outline"
              iconName="Plus"
              iconPosition="left"
              size="sm"
              onClick={() => setShowAddRoute(true)}
            >
              Add Route
            </Button>

            

          </div>

        </div>

      </div>

      <div className="p-6">

        {loading && (
          <p className="text-center text-muted-foreground">
            Loading routes...
          </p>
        )}

        <div className="grid gap-4">

          {routes.map((route) => (

            <div
              key={route.id}
              className={`p-4 border rounded-lg cursor-pointer ${
                selectedRoute === route.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() =>
                setSelectedRoute(selectedRoute === route.id ? null : route.id)
              }
            >

              <div className="flex items-center justify-between">

                <div className="flex items-center space-x-4">

                  <Icon name="Bus" size={20} className="text-primary" />

                  <div>

                    <h4 className="font-medium text-foreground">
                      {route.name}
                    </h4>

                    <p className="text-sm text-muted-foreground">
                      • Bus Assigned: {route.busNumber}
                    </p>

                  </div>

                </div>

                <div className="flex items-center space-x-4">

                  <div className="text-right hidden sm:block">

                    <span
                      className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${getStatusColor(route.status)}`}
                    >

                      <Icon name={getStatusIcon(route.status)} size={12} />

                      <span className="capitalize">
                        {route.status}
                      </span>

                    </span>

                    <p className="text-xs text-muted-foreground mt-1">
                      Updated: {formatLastUpdate(route.lastUpdate)}
                    </p>

                  </div>

                  <Icon
                    name={selectedRoute === route.id ? "ChevronUp" : "ChevronDown"}
                    size={20}
                    className="text-muted-foreground"
                  />

                </div>

              </div>

              {selectedRoute === route.id && (

              <div className="mt-4 pt-4 border-t border-border">

                {/* STATS GRID */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

                  <div className="text-center p-3 bg-muted/30 rounded-lg">

                    <Icon name="MapPin" size={20} className="text-primary mx-auto mb-1" />

                    <p className="text-sm font-medium text-foreground">
                      {route.totalStops}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Total Stops
                    </p>

                  </div>

                  <div className="text-center p-3 bg-muted/30 rounded-lg">

                    <Icon name="Users" size={20} className="text-success mx-auto mb-1" />

                    <p className="text-sm font-medium text-foreground">
                      {route.activeStudents}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Active Students
                    </p>

                  </div>

                  <div className="text-center p-3 bg-muted/30 rounded-lg">

                    <Icon name="Clock" size={20} className="text-warning mx-auto mb-1" />

                    <p className="text-sm font-medium text-foreground">
                      {route.estimatedTime}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Est. Time
                    </p>

                  </div>

                  <div className="text-center p-3 bg-muted/30 rounded-lg">

                    <Icon name="Navigation" size={20} className="text-error mx-auto mb-1" />

                    <p className="text-sm font-medium text-foreground">
                      Live
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Tracking
                    </p>

                  </div>

                </div>

                {/* BUTTON ROW (OUTSIDE GRID) */}
                <div className="flex flex-wrap gap-2 mb-4">

                <Button
                  variant="default"
                  size="sm"
                  iconName="MapPin"
                  onClick={()=>{
                  setActiveRouteId(route.id);
                  setShowStopsModal(true);
                  }}
                  >
                  Manage Stops
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  iconName="Bus"
                  onClick={()=>{
                  setSelectedRouteId(route.id);
                  setShowAssignBus(true);
                  }}
                  >
                  Assign Bus
               </Button>

                 

                </div>

                {/* LOCATION */}
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg mb-4">

                  <div className="flex items-center space-x-2">

                    <Icon name="MapPin" size={16} className="text-primary" />

                    <span className="text-sm font-medium text-foreground">
                      Current Location:
                    </span>

                  </div>

                  <span className="text-sm text-muted-foreground">
                    {route.currentLocation}
                  </span>

                </div>

              </div>

              )}

            </div>

          ))}

        </div>

      </div>
      <AssignBusModal
        routeId={selectedRouteId}
        open={showAssignBus}
        onClose={()=>setShowAssignBus(false)}
        onAssigned={fetchRoutes}
        />
      <RouteStopsModal
        routeId={activeRouteId}
        open={showStopsModal}
        onClose={()=>setShowStopsModal(false)}
        onStopAdded={fetchRoutes}
      />
        <AddRouteModal
        open={showAddRoute}
        onClose={() => setShowAddRoute(false)}
        onRouteAdded={fetchRoutes}
      />
    </div>
  );
};

export default RouteManagementPanel;
