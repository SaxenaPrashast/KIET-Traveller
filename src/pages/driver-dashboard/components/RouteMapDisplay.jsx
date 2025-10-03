import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import MapNavigationController from '../../../components/ui/MapNavigationController';
import RealTimeStatusIndicator from '../../../components/ui/RealTimeStatusIndicator';

const KIET_COORDINATES = [77.4977, 28.7520]; // KIET coordinates [longitude, latitude]

// MapLibre style configuration
const MAP_STYLE = {
  version: 8,
  sources: {
    'osm': {
      type: 'raster',
      tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors'
    }
  },
  layers: [{
    id: 'osm',
    type: 'raster',
    source: 'osm',
    minzoom: 0,
    maxzoom: 19
  }]
};

const RouteMapDisplay = ({ currentRoute, onLocationUpdate }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const locationMarkerRef = useRef(null);

  // Mock current location and route data
  const mockRouteData = {
    id: 'route-3',
    name: 'Route 3 - Main Campus',
    stops: [
      { id: 'stop-1', name: 'Main Gate', coordinates: [77.4977, 28.7520], eta: '09:15', status: 'completed' },
      { id: 'stop-2', name: 'Library Block', coordinates: [77.4987, 28.7530], eta: '09:20', status: 'current' },
      { id: 'stop-3', name: 'Hostel Complex', coordinates: [77.4997, 28.7540], eta: '09:25', status: 'upcoming' },
      { id: 'stop-4', name: 'Sports Complex', coordinates: [77.5007, 28.7550], eta: '09:30', status: 'upcoming' }
    ],
    passengers: [
      { id: 'p1', name: 'Rahul Sharma', stop: 'Library Block', type: 'pickup' },
      { id: 'p2', name: 'Priya Singh', stop: 'Hostel Complex', type: 'dropoff' }
    ]
  };

  useEffect(() => {
    // Simulate GPS location updates
    const interval = setInterval(() => {
      const newLocation = {
        lat: 28.7041 + (Math.random() - 0.5) * 0.01,
        lng: 77.1025 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date()
      };
      setCurrentLocation(newLocation);
      onLocationUpdate?.(newLocation);
    }, 5000);

    return () => clearInterval(interval);
  }, [onLocationUpdate]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 1, 18));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 1, 8));
  };

  const handleCenter = () => {
    if (currentLocation) {
      setMapCenter({ lat: currentLocation?.lat, lng: currentLocation?.lng });
    }
  };

  const getStopStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10 border-success';
      case 'current':
        return 'text-warning bg-warning/10 border-warning';
      case 'upcoming':
        return 'text-muted-foreground bg-muted border-border';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="relative h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Map Container */}
      <div className="relative h-full">
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="Driver Route Map"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${mapCenter?.lat},${mapCenter?.lng}&z=${zoomLevel}&output=embed`}
          className="w-full h-full"
        />

        {/* Map Overlay Controls */}
        <div className="absolute top-4 right-4 z-10">
          <MapNavigationController
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onCenter={handleCenter}
            showLayerToggle={true}
            onToggleLayer={() => {}}
          />
        </div>

        {/* Status Indicator */}
        <div className="absolute top-4 left-4 z-10">
          <RealTimeStatusIndicator />
        </div>

        {/* Current Location Indicator */}
        {currentLocation && (
          <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg shadow-card p-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="text-sm">
                <div className="font-medium text-foreground">Current Position</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {currentLocation?.lat?.toFixed(6)}, {currentLocation?.lng?.toFixed(6)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Route Information Panel */}
      <div className="absolute bottom-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-modal">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">{mockRouteData?.name}</h3>
            <Icon name="Route" size={20} className="text-primary" />
          </div>

          {/* Upcoming Stops */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {mockRouteData?.stops?.map((stop, index) => (
              <div
                key={stop?.id}
                className={`flex items-center justify-between p-2 rounded-lg border ${getStopStatusColor(stop?.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-current/20">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">{stop?.name}</div>
                    <div className="text-xs opacity-75">ETA: {stop?.eta}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {stop?.status === 'current' && (
                    <Icon name="MapPin" size={16} className="text-warning" />
                  )}
                  {stop?.status === 'completed' && (
                    <Icon name="CheckCircle" size={16} className="text-success" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Passenger Info */}
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Passengers:</span>
              <span className="font-medium text-foreground">{mockRouteData?.passengers?.length}</span>
            </div>
            <div className="mt-2 space-y-1">
              {mockRouteData?.passengers?.slice(0, 2)?.map((passenger) => (
                <div key={passenger?.id} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{passenger?.name}</span>
                  <div className="flex items-center space-x-1">
                    <Icon 
                      name={passenger?.type === 'pickup' ? 'UserPlus' : 'UserMinus'} 
                      size={12} 
                      className={passenger?.type === 'pickup' ? 'text-success' : 'text-warning'} 
                    />
                    <span className="text-muted-foreground">{passenger?.stop}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMapDisplay;