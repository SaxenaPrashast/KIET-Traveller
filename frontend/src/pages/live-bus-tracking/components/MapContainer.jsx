import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import MapNavigationController from '../../../components/ui/MapNavigationController';
import { KIET_COORDINATES, MAPLIBRE_STYLE } from '../../../config/constants';

const MapContainer = ({ 
  buses, 
  selectedBus, 
  onBusSelect, 
  userLocation,
  selectedRoutes,
  className = '' 
}) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [mapLayer, setMapLayer] = useState('streets');

  // Filter buses based on selected routes
  const filteredBuses = buses?.filter(bus => 
    selectedRoutes?.length === 0 || selectedRoutes?.includes(bus?.routeId)
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    mapInstance.current = new maplibregl.Map({
      container: mapRef.current,
      style: MAPLIBRE_STYLE,
      center: KIET_COORDINATES,
      zoom: 13,
      attributionControl: true
    });

    // Add navigation controls
    mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Add scale control
    mapInstance.current.addControl(new maplibregl.ScaleControl(), 'bottom-left');

    // Add fullscreen control
    mapInstance.current.addControl(new maplibregl.FullscreenControl());

    // Add OpenStreetMap attribution
    mapInstance.current.addControl(
      new maplibregl.AttributionControl({
        customAttribution: '© OpenStreetMap contributors'
      })
    );

    // Clean up on unmount
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update markers and handle bus locations
  useEffect(() => {
    if (!mapInstance.current) return;

    // Store all markers created in this effect
    const markers = [];

    filteredBuses.forEach(bus => {
      const coordinates = [bus.longitude, bus.latitude];
      
      const el = document.createElement('div');
      el.className = 'bus-marker';
      if (selectedBus?.id === bus.id) {
        el.classList.add('selected');
      }
      
      // Create a bus marker with better visibility
      el.innerHTML = `
        <div class="marker-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="bus-icon">
            <path fill="currentColor" d="M17 20h-2v-2H9v2H7v-8.5c0-1.48 1.09-2.5 2.5-2.5h5c1.41 0 2.5 1.02 2.5 2.5V20M6 11V6c0-4.42 3.58-8 8-8s8 3.58 8 8v5h2v2h-2v7h-2v-1h-2v1H6v-1H4v1H2v-7H0v-2h2V6c0-2.74 1.23-5.19 3.16-6.84l1.42 1.42C5.21 1.82 4 3.77 4 6v5h2m8-1c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2m-6 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
          ${bus.routeNumber ? `<span class="route-number">${bus.routeNumber}</span>` : ''}
        </div>
      `;

      new maplibregl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${bus.routeName || 'Bus ' + bus.id}</h3>
              <p class="text-sm">Route: ${bus.routeNumber || 'N/A'}</p>
              <p class="text-sm">Speed: ${bus.speed || '0'} km/h</p>
            </div>
          `))
        .addTo(mapInstance.current);

      el.addEventListener('click', () => onBusSelect(bus));
      
      // Store the marker reference for cleanup
      const marker = new maplibregl.Marker(el)
        .setLngLat(coordinates)
        .setPopup(new maplibregl.Popup({ offset: 25 })
          .setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${bus.routeName || 'Bus ' + bus.id}</h3>
              <p class="text-sm">Route: ${bus.routeNumber || 'N/A'}</p>
              <p class="text-sm">Speed: ${bus.speed || '0'} km/h</p>
            </div>
          `))
        .addTo(mapInstance.current);
        
      markers.push(marker);
    });

    // Cleanup function to remove all markers when component updates or unmounts
    return () => {
      markers.forEach(marker => marker.remove());
    };
  }, [filteredBuses, selectedBus, onBusSelect]);

  // Draw route line for selected bus
  useEffect(() => {
    if (!mapInstance.current || !selectedBus?.route?.coordinates) return;

    const map = mapInstance.current;
    const sourceId = 'route';
    const layerId = 'route-line';

    // Remove existing route if any
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // Add new route
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: selectedBus.route.coordinates
        }
      }
    });

    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });

    // Center map on route
    const bounds = selectedBus.route.coordinates.reduce((bounds, coord) => 
      bounds.extend(coord), new maplibregl.LngLatBounds(selectedBus.route.coordinates[0], selectedBus.route.coordinates[0])
    );

    map.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }, [selectedBus]);

  // Handle controls
  const handleZoomIn = () => {
    mapInstance.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstance.current?.zoomOut();
  };

  const handleCenter = () => {
    if (!mapInstance.current) return;

    const location = userLocation 
      ? [userLocation.longitude, userLocation.latitude]
      : selectedBus 
        ? [selectedBus.longitude, selectedBus.latitude]
        : KIET_COORDINATES;

    mapInstance.current.flyTo({
      center: location,
      zoom: 15,
      duration: 1000
    });
  };

  const handleLayerToggle = (layer) => {
    if (!mapInstance.current) return;

    const styles = {
      streets: MAPLIBRE_STYLE_URL,
      satellite: 'https://api.maptiler.com/maps/satellite/style.json',
      hybrid: 'https://api.maptiler.com/maps/hybrid/style.json'
    };

    setMapLayer(layer);
    if (styles[layer]) {
      mapInstance.current.setStyle(styles[layer]);
    }
  };

  return (
    <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />
      
      {/* Custom map controls */}
      <MapNavigationController
        className="absolute bottom-4 right-4 z-10 bg-white bg-opacity-90 rounded-lg shadow-lg"
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCenter={handleCenter}
        onLayerChange={handleLayerToggle}
        currentLayer={mapLayer}
      />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 p-3 rounded-lg shadow-lg z-10">
        <h4 className="text-xs font-medium mb-2">Legend</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-xs">On Time</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span className="text-xs">Delayed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span className="text-xs">Disrupted</span>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {!filteredBuses?.length && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="loader-2" className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">Loading bus locations...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
