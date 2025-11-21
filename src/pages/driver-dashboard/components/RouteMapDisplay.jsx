import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import MapNavigationController from '../../../components/ui/MapNavigationController';
import RealTimeStatusIndicator from '../../../components/ui/RealTimeStatusIndicator';

const KIET_COORDINATES = [77.4977, 28.7520];

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
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [buses, setBuses] = useState([]);
  const markersRef = useRef([]);

  // Generate mock buses with animated routes
  const generateMockBuses = () => [
    {
      id: 'bus-1',
      busNumber: 'KT-001',
      startLat: 29.0176,    // Meerut
      startLng: 77.7079,
      endLat: 28.7520,      // KIET
      endLng: 77.4977,
      currentLat: 28.7520,
      currentLng: 77.4977,
      progress: 0,
      speed: 0.015,         // Fast pace for illustration
      direction: 1,         // 1 or -1 for ping-pong
      status: 'in_transit',
      routeNumber: '1',
      routeName: 'Meerut to KIET',
      currentOccupancy: 45,
      capacity: 60
    },
    {
      id: 'bus-2',
      busNumber: 'KT-002',
      startLat: 28.5944,    // Noida
      startLng: 77.3629,
      endLat: 28.7520,      // KIET
      endLng: 77.4977,
      currentLat: 28.5944,
      currentLng: 77.3629,
      progress: 0.3,
      speed: 0.018,         // Slightly faster
      direction: 1,
      status: 'in_transit',
      routeNumber: '2',
      routeName: 'Noida to KIET',
      currentOccupancy: 52,
      capacity: 60
    },
    {
      id: 'bus-3',
      busNumber: 'KT-003',
      startLat: 29.0176,    // Meerut
      startLng: 77.7079,
      endLat: 28.7520,      // KIET
      endLng: 77.4977,
      currentLat: 29.0176,
      currentLng: 77.7079,
      progress: 0.5,
      speed: 0.012,
      direction: 1,
      status: 'in_transit',
      routeNumber: '3',
      routeName: 'Meerut to KIET',
      currentOccupancy: 30,
      capacity: 60
    }
  ];

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    try {
      if (!mapContainer.current) return;

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: MAP_STYLE,
        center: KIET_COORDINATES,
        zoom: 13
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
      map.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');
      
      console.log('Map initialized successfully');

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, []);

  // Load initial buses
  useEffect(() => {
    setBuses(generateMockBuses());
  }, []);

  // Animate bus movement between cities
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBuses(prevBuses => prevBuses.map(bus => {
        let newProgress = bus.progress + bus.speed;
        let newDirection = bus.direction;

        // Ping-pong animation - reverse direction at endpoints
        if (newProgress >= 1) {
          newProgress = 1;
          newDirection = -1;
        } else if (newProgress <= 0) {
          newProgress = 0;
          newDirection = 1;
        }

        // Interpolate current position between start and end
        const currentLat = bus.startLat + (bus.endLat - bus.startLat) * newProgress;
        const currentLng = bus.startLng + (bus.endLng - bus.startLng) * newProgress;

        // Calculate speed based on progress direction
        const speed = Math.abs(currentLat - bus.currentLat) * 100;

        return {
          ...bus,
          currentLat,
          currentLng,
          progress: newProgress,
          direction: newDirection,
          speed: speed.toFixed(0)
        };
      }));
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  // Create animated SVG bus icon
  const createBusSVG = (bus) => {
    // Calculate rotation angle based on start and end points
    const lat1 = bus.startLat;
    const lng1 = bus.startLng;
    const lat2 = bus.endLat;
    const lng2 = bus.endLng;
    
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(${angle} 24 24)">
          <!-- Bus body -->
          <rect x="10" y="8" width="28" height="20" rx="3" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
          
          <!-- Windows -->
          <rect x="13" y="11" width="6" height="5" fill="#60a5fa"/>
          <rect x="21" y="11" width="6" height="5" fill="#60a5fa"/>
          <rect x="29" y="11" width="6" height="5" fill="#60a5fa"/>
          
          <!-- Front -->
          <rect x="10" y="8" width="3" height="4" fill="#fbbf24"/>
          
          <!-- Front wheels -->
          <circle cx="14" cy="30" r="3" fill="#1f2937" stroke="#000" stroke-width="1"/>
          <circle cx="34" cy="30" r="3" fill="#1f2937" stroke="#000" stroke-width="1"/>
          
          <!-- Door -->
          <line x1="24" y1="8" x2="24" y2="28" stroke="#1f2937" stroke-width="1"/>
          
          <!-- Status indicator -->
          <circle cx="24" cy="4" r="2" fill="#22c55e"/>
        </g>
      </svg>
    `;

    return svg;
  };

  // Update bus markers
  useEffect(() => {
    if (!map.current || !buses.length) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers with SVG buses
    buses.forEach(bus => {
      try {
        const el = document.createElement('div');
        el.style.width = '48px';
        el.style.height = '48px';
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.cursor = 'pointer';

        // Create SVG bus
        const svgString = createBusSVG(bus);
        el.innerHTML = svgString;

        const popup = new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 10px; font-size: 12px;">
              <strong>${bus.busNumber}</strong><br/>
              Route: ${bus.routeName}<br/>
              Number: ${bus.routeNumber}<br/>
              Speed: ${bus.speed} km/h<br/>
              Status: in transit<br/>
              Occupancy: ${bus.currentOccupancy}/${bus.capacity}
            </div>
          `);

        const marker = new maplibregl.Marker(el)
          .setLngLat([bus.currentLng, bus.currentLat])
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);
      } catch (error) {
        console.error('Error creating marker:', error);
      }
    });
  }, [buses]);

  // Simulate location updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newLocation = {
        lat: 28.7520 + (Math.random() - 0.5) * 0.01,
        lng: 77.4977 + (Math.random() - 0.5) * 0.01,
        timestamp: new Date()
      };
      setCurrentLocation(newLocation);
      onLocationUpdate?.(newLocation);
    }, 3000);

    return () => clearInterval(interval);
  }, [onLocationUpdate]);

  const mockRouteData = {
    id: 'route-3',
    name: 'Route 3 - Main Campus',
    stops: [
      { id: 'stop-1', name: 'Main Gate', eta: '09:15', status: 'completed' },
      { id: 'stop-2', name: 'Library Block', eta: '09:20', status: 'current' },
      { id: 'stop-3', name: 'Hostel Complex', eta: '09:25', status: 'upcoming' },
      { id: 'stop-4', name: 'Sports Complex', eta: '09:30', status: 'upcoming' }
    ],
    passengers: [
      { id: 'p1', name: 'Rahul Sharma', stop: 'Library Block', type: 'pickup' },
      { id: 'p2', name: 'Priya Singh', stop: 'Hostel Complex', type: 'dropoff' }
    ]
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
      <div ref={mapContainer} className="relative h-full w-full" />

      {/* Map Overlay Controls */}
      <div className="absolute top-4 right-4 z-10">
        <MapNavigationController
          onZoomIn={() => map.current?.zoomIn()}
          onZoomOut={() => map.current?.zoomOut()}
          onCenter={() => {
            if (currentLocation) {
              map.current?.flyTo({
                center: [currentLocation.lng, currentLocation.lat],
                zoom: 15,
                duration: 1000
              });
            }
          }}
          showLayerToggle={false}
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

      {/* Active Buses Count */}
      <div className="absolute bottom-20 left-4 z-10 bg-card border border-border rounded-lg shadow-card p-3">
        <div className="text-sm">
          <div className="font-medium text-foreground">Active Buses</div>
          <div className="text-lg font-bold text-primary">{buses.length}</div>
        </div>
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