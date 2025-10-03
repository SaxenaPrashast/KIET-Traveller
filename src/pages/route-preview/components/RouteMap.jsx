import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import MapNavigationController from '../../../components/ui/MapNavigationController';

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

const RouteMap = ({ selectedRoute, onStopClick }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
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

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Initialize map
      mapInstance.current = new maplibregl.Map({
        container: mapRef.current,
        style: MAP_STYLE,
        center: KIET_COORDINATES,
        zoom: 14
      });

      // Add navigation controls
      mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');
    }

    // Clean up function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      // Clear markers
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers for selected route
    if (selectedRoute && routeStops[selectedRoute]) {
      routeStops[selectedRoute].forEach(stop => {
        // Create marker element
        const markerEl = document.createElement('div');
        markerEl.className = 'custom-marker';
        
        // Create icon element
        const iconEl = document.createElement('div');
        iconEl.className = 'text-primary-600 w-6 h-6';
        iconEl.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" /></svg>';
        
        markerEl.appendChild(iconEl);

        // Add click handler
        markerEl.addEventListener('click', () => onStopClick(stop));

        // Create and store marker
        const marker = new maplibregl.Marker(markerEl)
          .setLngLat(stop.coordinates)
          .addTo(mapInstance.current);

        markersRef.current.push(marker);
      });

      // Fit bounds to show all markers
      const coordinates = routeStops[selectedRoute].map(stop => stop.coordinates);
      if (coordinates.length > 0) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

        mapInstance.current.fitBounds(bounds, {
          padding: 50
        });
      }
    }
  }, [selectedRoute, onStopClick]);

  const currentStops = routeStops?.[selectedRoute] || routeStops?.['route-1'];

  const handleZoomIn = () => {
    if (mapInstance.current) {
      const zoom = mapInstance.current.getZoom();
      mapInstance.current.setZoom(Math.min(zoom + 1, 18));
    }
  };

  // Handle zoom out
  const handleZoomOut = () => {
    if (mapInstance.current) {
      const zoom = mapInstance.current.getZoom();
      mapInstance.current.setZoom(Math.max(zoom - 1, 10));
    }
  };

  // Handle centering on current stops
  const handleCenter = () => {
    if (!mapInstance.current || !currentStops?.length) return;

    const coordinates = currentStops.map(stop => stop.coordinates);
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord);
    }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));

    mapInstance.current.fitBounds(bounds, {
      padding: 50
    });
  };

  // Handle layer toggling
  const handleLayerToggle = (layer) => {
    // Layer toggling can be implemented here if needed
    console.log('Layer toggle:', layer);
  };

  // Call handleCenter when selectedRoute changes
  useEffect(() => {
    handleCenter();
  }, [selectedRoute]);

  return (
    <div className="relative bg-card border border-border rounded-lg overflow-hidden shadow-card h-[500px]">
      {/* Map container */}
      <div ref={mapRef} className="absolute inset-0"></div>

      {/* Stops count */}
      <div className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2">
        <div className="flex items-center space-x-2">
          <Icon name="mapPin" size={16} className="text-primary" />
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
    </div>
  );
};

export default RouteMap;