import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import RouteMapDisplay from './components/RouteMapDisplay';
import PassengerManifest from './components/PassengerManifest';
import ShiftManagement from './components/ShiftManagement';

const DriverDashboard = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  const handleLocationUpdate = (location) => {
    setCurrentLocation(location);
    console.log('Location updated:', location);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="px-3 sm:px-4 lg:px-6 pb-6">
          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Left Column - Map */}
            <div className="lg:col-span-2 space-y-4 lg:space-y-6">
              {/* Route Map */}
              <div className="h-64 sm:h-80 lg:h-[500px]">
                <RouteMapDisplay
                  currentRoute="route-3"
                  onLocationUpdate={handleLocationUpdate}
                />
              </div>
            </div>

            {/* Right Column - Passenger and Shift Management */}
            <div className="space-y-4 lg:space-y-6">
              <PassengerManifest />
              <ShiftManagement />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;