import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import RouteMapDisplay from './components/RouteMapDisplay';
import DriverControlPanel from './components/DriverControlPanel';
import PassengerManifest from './components/PassengerManifest';
import RouteStatusControls from './components/RouteStatusControls';
import ShiftManagement from './components/ShiftManagement';

const DriverDashboard = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [routeStatus, setRouteStatus] = useState('active');

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
    console.log('Location updated:', location);
  };

  const handleGPSToggle = (enabled) => {
    console.log('GPS sharing:', enabled ? 'enabled' : 'disabled');
  };

  const handleDelayReport = () => {
    console.log('Delay report initiated');
  };

  const handleEmergencyAlert = () => {
    console.log('Emergency alert triggered');
  };

  const handleStatusUpdate = (status) => {
    console.log('Route status updated:', status);
    setRouteStatus(status?.type);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Emergency Alerts */}
        <div className="px-4 lg:px-6 py-4">
          <EmergencyAlertBanner />
        </div>

        <div className="px-4 lg:px-6 pb-6">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Map and Controls */}
            <div className="xl:col-span-2 space-y-6">
              {/* Route Map */}
              <div className="h-96 lg:h-[500px]">
                <RouteMapDisplay
                  currentRoute="route-3"
                  onLocationUpdate={handleLocationUpdate}
                />
              </div>

              {/* Driver Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DriverControlPanel
                  onGPSToggle={handleGPSToggle}
                  onDelayReport={handleDelayReport}
                  onEmergencyAlert={handleEmergencyAlert}
                />
                <RouteStatusControls
                  onStatusUpdate={handleStatusUpdate}
                />
              </div>
            </div>

            {/* Right Column - Passenger and Shift Management */}
            <div className="space-y-6">
              <PassengerManifest />
              <ShiftManagement />
            </div>
          </div>

          {/* Mobile-Optimized Bottom Section */}
          <div className="mt-6 lg:hidden">
            <div className="bg-card border border-border rounded-lg shadow-card p-4">
              <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDelayReport}
                  className="flex items-center justify-center space-x-2 p-4 bg-warning/10 border border-warning/20 rounded-lg text-warning"
                >
                  <span className="text-sm font-medium">Report Delay</span>
                </button>
                <button
                  onClick={handleEmergencyAlert}
                  className="flex items-center justify-center space-x-2 p-4 bg-error/10 border border-error/20 rounded-lg text-error"
                >
                  <span className="text-sm font-medium">Emergency</span>
                </button>
              </div>
            </div>
          </div>

          {/* Current Status Summary */}
          <div className="mt-6 bg-card border border-border rounded-lg shadow-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
                <div>
                  <div className="font-medium text-foreground">Route 3 - Main Campus</div>
                  <div className="text-sm text-muted-foreground">
                    Active • {currentLocation ? 'GPS Connected' : 'GPS Connecting'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm text-foreground">
                  {new Date()?.toLocaleTimeString('en-US', { hour12: false })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date()?.toLocaleDateString('en-US')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;