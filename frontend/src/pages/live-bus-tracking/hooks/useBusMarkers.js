import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';

export const useBusMarkers = (map, buses, onBusSelect, selectedBus) => {
  const markers = useRef(new Map());

  useEffect(() => {
    if (!map || !buses) return;

    // Remove markers that are no longer present
    markers.current.forEach((marker, busId) => {
      if (!buses.find(bus => bus.id === busId)) {
        marker.remove();
        markers.current.delete(busId);
      }
    });

    // Update or add markers for current buses
    buses.forEach(bus => {
      const coordinates = [bus.longitude, bus.latitude];
      
      if (markers.current.has(bus.id)) {
        // Update existing marker position
        markers.current.get(bus.id).setLngLat(coordinates);
      } else {
        // Create new marker
        const markerElement = document.createElement('div');
        markerElement.className = `bus-marker ${selectedBus?.id === bus.id ? 'selected' : ''}`;
        markerElement.innerHTML = `
          <div class="relative p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
              <path d="M19 17h2l.64-2.54c.24-.959.24-1.962 0-2.92l-1.07-4.27A3 3 0 0 0 17.66 5H4a2 2 0 0 0-2 2v10h2"></path>
              <path d="M14 17H9"></path>
              <circle cx="6.5" cy="17.5" r="2.5"></circle>
              <circle cx="16.5" cy="17.5" r="2.5"></circle>
            </svg>
            ${bus.routeNumber ? `<span class="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">${bus.routeNumber}</span>` : ''}
          </div>
        `;

        const marker = new maplibregl.Marker({
          element: markerElement,
          anchor: 'center'
        })
          .setLngLat(coordinates)
          .setPopup(new maplibregl.Popup().setHTML(`
            <div class="p-2">
              <h3 class="font-bold">${bus.routeName || 'Bus ' + bus.id}</h3>
              <p class="text-sm">Route: ${bus.routeNumber || 'N/A'}</p>
              <p class="text-sm">Speed: ${bus.speed || '0'} km/h</p>
            </div>
          `))
          .addTo(map);

        markerElement.addEventListener('click', () => onBusSelect(bus));
        markers.current.set(bus.id, marker);
      }

      // Update marker selection state
      const marker = markers.current.get(bus.id);
      if (marker) {
        marker.getElement().classList.toggle('selected', selectedBus?.id === bus.id);
      }
    });

    // Clean up on unmount
    return () => {
      markers.current.forEach(marker => marker.remove());
      markers.current.clear();
    };
  }, [map, buses, selectedBus, onBusSelect]);

  return markers.current;
};
