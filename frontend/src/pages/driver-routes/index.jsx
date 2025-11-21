import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import RealTimeStatusIndicator from '../../components/ui/RealTimeStatusIndicator';
import DriverRouteSelector from './components/DriverRouteSelector';
import DriverRouteMap from './components/DriverRouteMap';
import DriverRouteInfo from './components/DriverRouteInfo';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const DriverRoutes = () => {
  const [selectedRoute, setSelectedRoute] = useState('route-1');
  const [selectedStop, setSelectedStop] = useState(null);
  const [isShareActive, setIsShareActive] = useState(false);
  const [expandedRouteSelection, setExpandedRouteSelection] = useState(false);
  const [expandedRouteInfo, setExpandedRouteInfo] = useState(false);
  const [shareLocation, setShareLocation] = useState({
    enabled: false,
    passengers: [],
    expiresAt: null
  });

  useEffect(() => {
    // Check if route is bookmarked
    const bookmarkedRoutes = JSON.parse(localStorage.getItem('bookmarkedRoutes') || '[]');
    setIsShareActive(bookmarkedRoutes?.includes(selectedRoute));
  }, [selectedRoute]);

  const handleRouteChange = (routeId) => {
    setSelectedRoute(routeId);
    setSelectedStop(null);
  };

  const handleToggleShareLocation = () => {
    setShareLocation(prev => ({
      ...prev,
      enabled: !prev.enabled,
      expiresAt: !prev.enabled ? new Date(Date.now() + 8 * 60 * 60 * 1000) : null // 8 hours
    }));
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Page Header */}
        <div className="px-4 lg:px-6 py-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Routes</h1>
              <p className="text-muted-foreground mt-1">
                Manage your route, share location with passengers, and track real-time data
              </p>
            </div>
            <RealTimeStatusIndicator />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3 overflow-x-auto">
            <Button
              variant={shareLocation.enabled ? "default" : "outline"}
              size="sm"
              iconName="MapPin"
              iconPosition="left"
              iconSize={16}
              onClick={handleToggleShareLocation}
              className={shareLocation.enabled ? "bg-success hover:bg-success/90" : ""}
            >
              {shareLocation.enabled ? "Location Shared" : "Share Location"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              iconSize={16}
            >
              View Passengers
            </Button>
          </div>
        </div>

        {/* Share Location Status Banner */}
        {shareLocation.enabled && (
          <div className="px-4 lg:px-6 pt-6">
            <div className="p-4 bg-success/5 border border-success/20 rounded-lg flex items-center justify-between animate-in fade-in">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-success/10 rounded-full animate-pulse">
                  <Icon name="MapPin" size={16} className="text-success" />
                </div>
                <div>
                  <h4 className="font-medium text-success">Location Sharing Active</h4>
                  <p className="text-sm text-success/80">
                    Passengers can see your real-time location
                    {shareLocation.expiresAt && ` • Expires at ${shareLocation.expiresAt.toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleShareLocation}
                className="text-success hover:bg-success/10"
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Map */}
            <div className="lg:col-span-2">
              <DriverRouteMap
                selectedRoute={selectedRoute}
                onStopClick={handleStopClick}
                shareLocationEnabled={shareLocation.enabled}
              />
            </div>

            {/* Right Column - Route Information */}
            <div className="space-y-6">
              {/* Route Selection Button */}
              <div>
                <DriverRouteSelector
                  selectedRoute={selectedRoute}
                  onRouteChange={handleRouteChange}
                  onExpand={() => setExpandedRouteSelection(!expandedRouteSelection)}
                  isExpanded={expandedRouteSelection}
                />
              </div>

              {/* Route Information Button */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setExpandedRouteInfo(!expandedRouteInfo)}
                  className="w-full justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Icon name="Info" size={16} />
                    <span className="font-medium">Route Information</span>
                  </div>
                  <Icon 
                    name={expandedRouteInfo ? "ChevronUp" : "ChevronDown"} 
                    size={16} 
                    className="text-muted-foreground" 
                  />
                </Button>
                
                {expandedRouteInfo && (
                  <div className="mt-3 p-4 bg-card border border-border rounded-lg animate-in fade-in">
                    <DriverRouteInfo
                      selectedRoute={selectedRoute}
                      selectedStop={selectedStop}
                    />
                  </div>
                )}
              </div>

              {/* Location Sharing Info */}
              {shareLocation.enabled && (
                <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Icon name="Users" size={16} className="text-info" />
                    <h4 className="font-medium text-info">Passengers Can See</h4>
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full"></div>
                      <span>Your real-time location</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full"></div>
                      <span>Current speed and direction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full"></div>
                      <span>Next stop and ETA</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-info rounded-full"></div>
                      <span>Bus occupancy status</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverRoutes;
