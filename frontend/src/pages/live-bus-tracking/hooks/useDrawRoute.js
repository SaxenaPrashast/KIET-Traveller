import { useEffect } from 'react';
import maplibregl from 'maplibre-gl';

export const useDrawRoute = (map, route, color = '#3b82f6') => {
  useEffect(() => {
    if (!map || !route?.coordinates?.length) return;

    const sourceId = `route-${route.id}`;
    const layerId = `route-layer-${route.id}`;

    // Add the route source if it doesn't exist
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates
          }
        }
      });
    } else {
      // Update existing source
      map.getSource(sourceId).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route.coordinates
        }
      });
    }

    // Add the route layer if it doesn't exist
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    }

    // Clean up on unmount
    return () => {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    };
  }, [map, route, color]);
};
