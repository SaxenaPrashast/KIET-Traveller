import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';

const DriverRouteMap = ({ selectedRoute, onStopClick, shareLocationEnabled }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const busesMRef = useRef([]);
  const busAnimationRef = useRef(null);

  // Route definitions with coordinates
  const routeData = {
    'route-1': {
      stops: [
        { id: 'stop-1', name: 'KIET Campus Gate', lat: 28.9955, lng: 77.6885 },
        { id: 'stop-2', name: 'Hostel Block A', lat: 28.9970, lng: 77.6900 },
        { id: 'stop-3', name: 'Academic Building', lat: 28.9980, lng: 77.6915 },
        { id: 'stop-4', name: 'Main Gate', lat: 29.0000, lng: 77.6900 }
      ],
      startPoint: { lat: 28.9800, lng: 77.6750 }
    },
    'route-2': {
      stops: [
        { id: 'stop-1', name: 'KIET Campus Gate', lat: 28.9955, lng: 77.6885 },
        { id: 'stop-2', name: 'Hostel Block B', lat: 28.9960, lng: 77.6870 },
        { id: 'stop-3', name: 'Library', lat: 28.9975, lng: 77.6890 },
        { id: 'stop-4', name: 'Sports Complex', lat: 29.0010, lng: 77.6920 }
      ],
      startPoint: { lat: 28.9800, lng: 77.6750 }
    },
    'route-3': {
      stops: [
        { id: 'stop-1', name: 'KIET Campus Gate', lat: 28.9955, lng: 77.6885 },
        { id: 'stop-2', name: 'Meerut City Center', lat: 29.0000, lng: 77.6900 },
        { id: 'stop-3', name: 'Shopping Mall', lat: 29.0050, lng: 77.6950 },
        { id: 'stop-4', name: 'City Transport Hub', lat: 29.0100, lng: 77.7000 }
      ],
      startPoint: { lat: 28.9800, lng: 77.6750 }
    },
    'route-4': {
      stops: [
        { id: 'stop-1', name: 'Hostel Complex', lat: 28.9960, lng: 77.6875 },
        { id: 'stop-2', name: 'Academic Block', lat: 28.9980, lng: 77.6915 },
        { id: 'stop-3', name: 'Cafeteria Area', lat: 28.9990, lng: 77.6905 },
        { id: 'stop-4', name: 'Main Campus', lat: 29.0000, lng: 77.6890 }
      ],
      startPoint: { lat: 28.9900, lng: 77.6800 }
    },
    'route-5': {
      stops: [
        { id: 'stop-1', name: 'Main Gate', lat: 28.9955, lng: 77.6885 },
        { id: 'stop-2', name: 'East Campus', lat: 28.9970, lng: 77.6920 },
        { id: 'stop-3', name: 'North Campus', lat: 29.0010, lng: 77.6900 },
        { id: 'stop-4', name: 'Main Gate', lat: 28.9955, lng: 77.6885 }
      ],
      startPoint: { lat: 28.9900, lng: 77.6800 }
    }
  };

  // Generate mock buses for the route
  const generateMockBuses = () => {
    const route = routeData[selectedRoute];
    if (!route) return [];

    const buses = [];
    for (let i = 0; i < 3; i++) {
      const firstStop = route.stops[0];
      const lastStop = route.stops[route.stops.length - 1];

      buses.push({
        id: `bus-${i + 1}`,
        startLat: firstStop.lat,
        startLng: firstStop.lng,
        endLat: lastStop.lat,
        endLng: lastStop.lng,
        progress: (i * 0.33) % 1,
        speed: 0.012 + Math.random() * 0.006,
        reverse: false,
        currentLat: firstStop.lat,
        currentLng: firstStop.lng,
        passengers: Math.floor(Math.random() * 40) + 10,
        capacity: 50
      });
    }
    return buses;
  };

  // Create SVG for bus marker
  const createBusSVG = (bus) => {
    const dLng = bus.endLng - bus.startLng;
    const dLat = bus.endLat - bus.startLat;
    const angle = Math.atan2(dLng, dLat) * 180 / Math.PI;

    return `
      <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(24, 24) rotate(${angle})">
          <rect x="-8" y="-12" width="16" height="24" rx="3" fill="#3B82F6" stroke="#1E40AF" stroke-width="1.5"/>
          <circle cx="-4" cy="6" r="2" fill="#fff"/>
          <circle cx="4" cy="6" r="2" fill="#fff"/>
          <rect x="-8" y="-12" width="16" height="8" rx="2" fill="#1E40AF" opacity="0.5"/>
          <polygon points="0,-14 -3,-10 3,-10" fill="#3B82F6" stroke="#1E40AF" stroke-width="1"/>
        </g>
      </svg>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const route = routeData[selectedRoute];
    if (!route) return;

    const defaultCenter = [route.stops[0].lng, route.stops[0].lat];

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openstreetmap.org/styles/osm-bright/style.json',
      center: defaultCenter,
      zoom: 14,
      pitch: 20,
      bearing: -20
    });

    map.current.on('load', () => {
      // Add stop markers
      route.stops.forEach(stop => {
        const el = document.createElement('div');
        el.className = 'w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-primary-foreground';
        el.innerHTML = '<span class="text-primary-foreground text-sm font-bold">' + route.stops.indexOf(stop) + 1 + '</span>';
        el.addEventListener('click', () => onStopClick(stop));

        new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([stop.lng, stop.lat])
          .addTo(map.current);
      });

      // Initialize buses
      busesMRef.current = generateMockBuses();
      animateBuses();
    });

    return () => {
      if (busAnimationRef.current) {
        cancelAnimationFrame(busAnimationRef.current);
      }
    };
  }, []);

  // Update map when route changes
  useEffect(() => {
    if (!map.current) return;

    const route = routeData[selectedRoute];
    if (!route) return;

    // Remove existing bus markers
    const markers = document.querySelectorAll('[data-bus-marker="true"]');
    markers.forEach(marker => marker.remove());

    // Update bus data
    busesMRef.current = generateMockBuses();
    animateBuses();

    // Center map on new route
    const defaultCenter = [route.stops[0].lng, route.stops[0].lat];
    map.current.flyTo({
      center: defaultCenter,
      zoom: 14,
      duration: 1000
    });
  }, [selectedRoute]);

  // Animate buses
  const animateBuses = () => {
    const animate = () => {
      busesMRef.current.forEach((bus, index) => {
        // Update progress
        bus.progress += bus.speed;
        if (bus.progress >= 1) {
          bus.reverse = !bus.reverse;
          bus.progress = 1;
        } else if (bus.progress <= 0) {
          bus.reverse = !bus.reverse;
          bus.progress = 0;
        }

        const progress = bus.reverse ? 1 - bus.progress : bus.progress;
        bus.currentLat = bus.startLat + (bus.endLat - bus.startLat) * progress;
        bus.currentLng = bus.startLng + (bus.endLng - bus.startLng) * progress;

        // Update or create marker
        let marker = document.querySelector(`[data-bus-id="${bus.id}"]`);
        if (!marker) {
          const el = document.createElement('div');
          el.setAttribute('data-bus-marker', 'true');
          el.setAttribute('data-bus-id', bus.id);
          el.innerHTML = createBusSVG(bus);
          el.style.cursor = 'pointer';
          el.addEventListener('click', () => {
            const popup = new maplibregl.Popup().setHTML(`
              <div class="p-3 text-sm">
                <h4 class="font-semibold text-foreground mb-2">${bus.id.toUpperCase()}</h4>
                <p class="text-muted-foreground"><strong>Passengers:</strong> ${bus.passengers}/${bus.capacity}</p>
                <p class="text-muted-foreground"><strong>Location:</strong> ${bus.currentLat.toFixed(4)}, ${bus.currentLng.toFixed(4)}</p>
                ${shareLocationEnabled ? `<p class="text-success mt-2"><strong>✓ Location being shared</strong></p>` : ''}
              </div>
            `);
            new maplibregl.Marker({ element: el })
              .setLngLat([bus.currentLng, bus.currentLat])
              .setPopup(popup)
              .addTo(map.current);
          });

          new maplibregl.Marker({ element: el, anchor: 'center' })
            .setLngLat([bus.currentLng, bus.currentLat])
            .addTo(map.current);

          marker = el;
        } else {
          marker.innerHTML = createBusSVG(bus);
        }

        // Update marker position
        const marker_el = document.querySelector(`[data-bus-id="${bus.id}"]`);
        if (marker_el) {
          const mapboxMarker = marker_el.parentElement?.parentElement;
          if (mapboxMarker) {
            const translate = mapboxMarker.style.transform || '';
            const rect = mapContainer.current?.getBoundingClientRect();
            if (rect) {
              // Update position (simplified - would need proper maplibregl marker updating)
            }
          }
        }
      });

      busAnimationRef.current = requestAnimationFrame(animate);
    };

    busAnimationRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-card border border-border">
      <div
        ref={mapContainer}
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      {shareLocationEnabled && (
        <div className="absolute top-4 right-4 bg-success/90 text-success-foreground px-3 py-2 rounded-lg flex items-center space-x-2 text-sm font-medium shadow-lg">
          <Icon name="MapPin" size={16} />
          <span>Sharing Location</span>
        </div>
      )}
    </div>
  );
};

export default DriverRouteMap;
