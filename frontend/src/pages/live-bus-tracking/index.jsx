import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import MapContainer from './components/MapContainer';
import BusDetailsPanel from './components/BusDetailsPanel';
import RouteFilter from './components/RouteFilter';
import LiveStatusBar from './components/LiveStatusBar';

import Button from '../../components/ui/Button';

const LiveBusTracking = () => {
  const navigate = useNavigate();
  const [selectedBus, setSelectedBus] = useState(null);
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);

  // Mock data for buses
  const mockBuses = [
    {
      id: "bus-001",
      routeId: 1,
      routeNumber: "1",
      routeName: "Main Campus - Hostel Block A",
      latitude: 28.7041,
      longitude: 77.1025,
      status: "on_time",
      currentCapacity: 25,
      maxCapacity: 40,
      nextStopETA: 8,
      delayMinutes: 0,
      driver: {
        name: "Rajesh Kumar",
        experience: 12
      },
      upcomingStops: [
        { id: "stop-1", name: "Library Junction", eta: 8 },
        { id: "stop-2", name: "Academic Block C", eta: 15 },
        { id: "stop-3", name: "Hostel Block A", eta: 22 }
      ]
    },
    {
      id: "bus-002",
      routeId: 1,
      routeNumber: "1",
      routeName: "Main Campus - Hostel Block A",
      latitude: 28.7051,
      longitude: 77.1035,
      status: "delayed",
      currentCapacity: 32,
      maxCapacity: 40,
      nextStopETA: 12,
      delayMinutes: 5,
      driver: {
        name: "Suresh Singh",
        experience: 8
      },
      upcomingStops: [
        { id: "stop-4", name: "Sports Complex", eta: 12 },
        { id: "stop-5", name: "Cafeteria", eta: 18 },
        { id: "stop-6", name: "Main Gate", eta: 25 }
      ]
    },
    {
      id: "bus-003",
      routeId: 2,
      routeNumber: "2",
      routeName: "Engineering Block - Medical Center",
      latitude: 28.7031,
      longitude: 77.1015,
      status: "on_time",
      currentCapacity: 18,
      maxCapacity: 35,
      nextStopETA: 6,
      delayMinutes: 0,
      driver: {
        name: "Amit Sharma",
        experience: 15
      },
      upcomingStops: [
        { id: "stop-7", name: "Engineering Block", eta: 6 },
        { id: "stop-8", name: "Research Center", eta: 13 },
        { id: "stop-9", name: "Medical Center", eta: 20 }
      ]
    },
    {
      id: "bus-004",
      routeId: 3,
      routeNumber: "3",
      routeName: "Hostel Block B - Shopping Complex",
      latitude: 28.7061,
      longitude: 77.1045,
      status: "breakdown",
      currentCapacity: 0,
      maxCapacity: 40,
      nextStopETA: 0,
      delayMinutes: 30,
      driver: {
        name: "Vikram Yadav",
        experience: 10
      },
      upcomingStops: []
    },
    {
      id: "bus-005",
      routeId: 2,
      routeNumber: "2",
      routeName: "Engineering Block - Medical Center",
      latitude: 28.7021,
      longitude: 77.1005,
      status: "on_time",
      currentCapacity: 28,
      maxCapacity: 35,
      nextStopETA: 10,
      delayMinutes: 0,
      driver: {
        name: "Manoj Gupta",
        experience: 7
      },
      upcomingStops: [
        { id: "stop-10", name: "Computer Center", eta: 10 },
        { id: "stop-11", name: "Admin Block", eta: 17 },
        { id: "stop-12", name: "Parking Area", eta: 24 }
      ]
    }
  ];

  // Mock data for routes
  const mockRoutes = [
    {
      id: 1,
      number: "1",
      name: "Main Campus - Hostel Block A",
      buses: mockBuses?.filter(bus => bus?.routeId === 1)
    },
    {
      id: 2,
      number: "2", 
      name: "Engineering Block - Medical Center",
      buses: mockBuses?.filter(bus => bus?.routeId === 2)
    },
    {
      id: 3,
      number: "3",
      name: "Hostel Block B - Shopping Complex", 
      buses: mockBuses?.filter(bus => bus?.routeId === 3)
    }
  ];

  // Request user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation?.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position?.coords?.latitude,
            lng: position?.coords?.longitude
          });
          setIsLocationEnabled(true);
        },
        (error) => {
          console.log("Location access denied:", error);
          setIsLocationEnabled(false);
        }
      );
    }
  }, []);

  const handleBusSelect = (bus) => {
    setSelectedBus(bus);
  };

  const handleRouteToggle = (routeId) => {
    setSelectedRoutes(prev => 
      prev?.includes(routeId) 
        ? prev?.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleClearAllRoutes = () => {
    setSelectedRoutes([]);
  };

  const handleSetReminder = (bus) => {
    // Mock reminder functionality
    alert(`Reminder set for Route ${bus?.routeNumber} - ETA: ${bus?.nextStopETA} minutes`);
  };

  const handleShareLocation = (bus) => {
    // Mock location sharing functionality
    if (navigator.share) {
      navigator.share({
        title: `KIET Traveller - Route ${bus?.routeNumber}`,
        text: `Bus Route ${bus?.routeNumber} is ${bus?.nextStopETA} minutes away from next stop.`,
        url: window.location?.href
      });
    } else {
      // Fallback for browsers without Web Share API
      navigator.clipboard?.writeText(
        `Bus Route ${bus?.routeNumber} is ${bus?.nextStopETA} minutes away. Track live: ${window.location?.href}`
      );
      alert("Location link copied to clipboard!");
    }
  };

  const handleRefresh = () => {
    // Mock refresh functionality - in real app would fetch latest data
    console.log("Refreshing bus data...");
  };

  const activeBuses = mockBuses?.filter(bus => bus?.status !== 'breakdown')?.length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Emergency Alerts */}
        <EmergencyAlertBanner className="mx-4 lg:mx-6 mt-4" />

        {/* Page Header */}
        <div className="px-4 lg:px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Live Bus Tracking</h1>
              <p className="text-muted-foreground">Real-time bus locations and arrival predictions</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => navigate('/route-preview')}
                iconName="Route"
                iconPosition="left"
                iconSize={16}
                className="hidden sm:flex"
              >
                View Routes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsLocationEnabled(!isLocationEnabled)}
                iconName={isLocationEnabled ? "MapPin" : "MapPinOff"}
                iconPosition="left"
                iconSize={16}
              >
                {isLocationEnabled ? "Location On" : "Enable Location"}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)]">
          {/* Left Sidebar - Desktop */}
          <div className="hidden lg:block w-80 border-r border-border bg-card overflow-y-auto">
            <div className="p-4 space-y-4">
              <LiveStatusBar
                totalBuses={mockBuses?.length}
                activeBuses={activeBuses}
                selectedRoutes={selectedRoutes}
                onRefresh={handleRefresh}
              />
              <RouteFilter
                routes={mockRoutes}
                selectedRoutes={selectedRoutes}
                onRouteToggle={handleRouteToggle}
                onClearAll={handleClearAllRoutes}
              />
            </div>
          </div>

          {/* Main Map Area */}
          <div className="flex-1 relative">
            <MapContainer
              buses={mockBuses}
              selectedBus={selectedBus}
              onBusSelect={handleBusSelect}
              userLocation={userLocation}
              selectedRoutes={selectedRoutes}
              className="h-full"
            />

            {/* Mobile Controls Overlay */}
            <div className="lg:hidden absolute top-4 left-4 right-4">
              <LiveStatusBar
                totalBuses={mockBuses?.length}
                activeBuses={activeBuses}
                selectedRoutes={selectedRoutes}
                onRefresh={handleRefresh}
                className="mb-4"
              />
            </div>

            {/* Mobile Route Filter */}
            <div className="lg:hidden absolute bottom-4 left-4 right-4">
              {!selectedBus && (
                <RouteFilter
                  routes={mockRoutes}
                  selectedRoutes={selectedRoutes}
                  onRouteToggle={handleRouteToggle}
                  onClearAll={handleClearAllRoutes}
                />
              )}
            </div>
          </div>

          {/* Right Panel - Bus Details (Desktop) */}
          {selectedBus && (
            <div className="hidden lg:block w-96 border-l border-border bg-card overflow-y-auto">
              <BusDetailsPanel
                selectedBus={selectedBus}
                onClose={() => setSelectedBus(null)}
                onSetReminder={handleSetReminder}
                onShareLocation={handleShareLocation}
              />
            </div>
          )}
        </div>

        {/* Mobile Bus Details Bottom Sheet */}
        {selectedBus && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[60vh] overflow-y-auto">
            <BusDetailsPanel
              selectedBus={selectedBus}
              onClose={() => setSelectedBus(null)}
              onSetReminder={handleSetReminder}
              onShareLocation={handleShareLocation}
            />
          </div>
        )}

        {/* Mobile Backdrop */}
        {selectedBus && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setSelectedBus(null)}
          />
        )}
      </main>
    </div>
  );
};

export default LiveBusTracking;