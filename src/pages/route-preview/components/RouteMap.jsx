import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import MapNavigationController from '../../../components/ui/MapNavigationController';

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

const RouteMap = ({ selectedRoute, onStopClick, shareLocationEnabled }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [buses, setBuses] = useState([]);
  const markersRef = useRef([]);

  const routeStops = {
    'route-1': [
      { id: 'stop-1', name: 'Main Campus Gate', coordinates: [77.4977, 28.7520], time: '08:00', delay: 0 },
      { id: 'stop-2', name: 'Academic Block A', coordinates: [77.4987, 28.7530], time: '08:05', delay: 2 },
      { id: 'stop-3', name: 'Library Junction', coordinates: [77.4997, 28.7540], time: '08:10', delay: 0 },
      { id: 'stop-4', name: 'Hostel Block A', coordinates: [77.5007, 28.7550], time: '08:15', delay: 1 }
    ],
    'route-2': [
      { id: 'stop-5', name: 'Sports Complex', coordinates: [77.5017, 28.7560], time: '08:30', delay: 0 },
      { id: 'stop-6', name: 'Research Center', coordinates: [77.5027, 28.7570], time: '08:35', delay: 3 },
      { id: 'stop-7', name: 'Cafeteria', coordinates: [77.5037, 28.7580], time: '08:40', delay: 0 }
    ]
  };

  // Generate mock buses with animated routes
  const generateMockBuses = () => [
    {
      id: 'bus-1',
      busNumber: 'KT-001',
      startLat: 29.0176,
      startLng: 77.7079,
      endLat: 28.7520,
      endLng: 77.4977,
      currentLat: 28.7520,
      currentLng: 77.4977,
      progress: 0,
      speed: 0.015,
      direction: 1,
      status: 'in_transit',
      routeNumber: '1',
      routeName: 'Meerut to KIET',
      currentOccupancy: 45,
      capacity: 60
    },
    {
      id: 'bus-2',
      busNumber: 'KT-002',
      startLat: 28.5944,
      startLng: 77.3629,
      endLat: 28.7520,
      endLng: 77.4977,
      currentLat: 28.5944,
      currentLng: 77.3629,
      progress: 0.3,
      speed: 0.018,
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
      startLat: 29.0176,
      startLng: 77.7079,
      endLat: 28.7520,
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

  // Create SVG bus icon
  const createBusSVG = (bus) => {
    const dLng = bus.endLng - bus.startLng;
    const dLat = bus.endLat - bus.startLat;
    const angle = Math.atan2(dLng, dLat) * (180 / Math.PI);

    const svg = `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${angle}deg)">
        <!-- Bus body -->
        <rect x="8" y="6" width="32" height="36" rx="4" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
        
        <!-- Windows -->
        <rect x="12" y="10" width="6" height="5" fill="#3b82f6" opacity="0.8"/>
        <rect x="22" y="10" width="6" height="5" fill="#3b82f6" opacity="0.8"/>
        <rect x="32" y="10" width="6" height="5" fill="#3b82f6" opacity="0.8"/>
        
        <!-- Door line -->
        <line x1="24" y1="18" x2="24" y2="36" stroke="#1f2937" stroke-width="1"/>
        
        <!-- Front light -->
        <circle cx="24" cy="8" r="1.5" fill="#fbbf24"/>
        
        <!-- Wheels -->
        <circle cx="14" cy="40" r="3" fill="#1f2937"/>
        <circle cx="34" cy="40" r="3" fill="#1f2937"/>
        
        <!-- Status indicator -->
        <circle cx="24" cy="4" r="2" fill="#22c55e"/>
      </svg>
    `;

    return svg;
  };

  // Initialize map
  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: MAP_STYLE,
        center: KIET_COORDINATES,
        zoom: 14
      });

      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  // Load initial buses
  useEffect(() => {
    setBuses(generateMockBuses());
  }, []);

  // Animate bus movement
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setBuses(prevBuses => prevBuses.map(bus => {
        let newProgress = bus.progress + bus.speed;
        let newDirection = bus.direction;

        if (newProgress >= 1) {
          newProgress = 1;
          newDirection = -1;
        } else if (newProgress <= 0) {
          newProgress = 0;
          newDirection = 1;
        }

        const currentLat = bus.startLat + (bus.endLat - bus.startLat) * newProgress;
        const currentLng = bus.startLng + (bus.endLng - bus.startLng) * newProgress;

        return {
          ...bus,
          currentLat,
          currentLng,
          progress: newProgress,
          direction: newDirection
        };
      }));
    }, 50);

    return () => clearInterval(animationInterval);
  }, []);

  // Update bus markers on map
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing bus markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new bus markers
    buses.forEach(bus => {
      const markerEl = document.createElement('div');
      markerEl.innerHTML = createBusSVG(bus);
      markerEl.style.cursor = 'pointer';

      markerEl.addEventListener('click', () => {
        // Show popup with bus info
        const popup = new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div style="padding: 12px; font-size: 12px;">
              <strong>${bus.busNumber}</strong><br/>
              Route: ${bus.routeName}<br/>
              Occupancy: ${bus.currentOccupancy}/${bus.capacity}<br/>
              Status: In Transit
            </div>
          `)
          .setLngLat([bus.currentLng, bus.currentLat])
          .addTo(mapInstance.current);
      });

      const marker = new maplibregl.Marker(markerEl)
        .setLngLat([bus.currentLng, bus.currentLat])
        .addTo(mapInstance.current);

      markersRef.current.push(marker);
    });
  }, [buses]);

  // Add stop markers
  useEffect(() => {
    if (!mapInstance.current) return;

    const currentStops = routeStops?.[selectedRoute] || routeStops?.['route-1'];

    currentStops.forEach(stop => {
      const markerEl = document.createElement('div');
      const pinEl = document.createElement('div');
      pinEl.className = 'text-primary-600 w-6 h-6';
      pinEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>';
      
      markerEl.appendChild(pinEl);
      markerEl.addEventListener('click', () => onStopClick(stop));

      const marker = new maplibregl.Marker(markerEl)
        .setLngLat(stop.coordinates)
        .addTo(mapInstance.current);

      markersRef.current.push(marker);
    });

    // Fit bounds
    const coordinates = currentStops.map(stop => stop.coordinates);
    if (coordinates.length > 0) {
      const bounds = coordinates.reduce((bounds, coord) => {
        return bounds.extend(coord);
      }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

      mapInstance.current.fitBounds(bounds, { padding: 50 });
    }
  }, [selectedRoute, onStopClick]);

  const currentStops = routeStops?.[selectedRoute] || routeStops?.['route-1'];

  const handleZoomIn = () => {
    if (mapInstance.current) {
      const zoom = mapInstance.current.getZoom();
      mapInstance.current.setZoom(Math.min(zoom + 1, 18));
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      const zoom = mapInstance.current.getZoom();
      mapInstance.current.setZoom(Math.max(zoom - 1, 10));
    }
  };

  const handleCenter = () => {
    if (!mapInstance.current || !currentStops?.length) return;

    const coordinates = currentStops.map(stop => stop.coordinates);
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

    mapInstance.current.fitBounds(bounds, { padding: 50 });
  };

  const handleLayerToggle = (layer) => {
    console.log('Layer toggle:', layer);
  };

  useEffect(() => {
    handleCenter();
  }, [selectedRoute]);

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-card h-[300px] sm:h-[400px] lg:h-[500px]">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0"></div>

      {/* Stops count */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">
            {currentStops?.length} stops
          </span>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute top-4 right-4 z-10">
        <MapNavigationController
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenter={handleCenter}
          onToggleLayer={handleLayerToggle}
        />
      </div>

      {/* Map Legend */}
      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-foreground">Bus Stops</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-1 bg-gradient-to-r from-primary to-secondary rounded"></div>
            <span className="text-foreground">Route Path</span>
          </div>
        </div>
      </div>

      {/* Location Sharing Indicator */}
      {shareLocationEnabled && (
        <div className="absolute top-4 right-4 bg-success/90 text-success-foreground px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium shadow-lg">
          <Icon name="MapPin" size={16} />
          <span>Sharing Location</span>
        </div>
      )}
    </div>
  );
};

export default RouteMap;