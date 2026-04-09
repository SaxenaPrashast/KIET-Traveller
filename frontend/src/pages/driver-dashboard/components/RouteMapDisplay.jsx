import React, { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import MapNavigationController from '../../../components/ui/MapNavigationController';

const KIET_COORDINATES = [77.4982, 28.7532];

const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
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

const formatScheduleDate = (value) => {
  if (!value) return 'No date';
  return new Date(value).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const RouteMapDisplay = ({ bus, route, currentSchedule, refreshing, onRefreshLocation, refreshLoading }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  const stopList = useMemo(
    () => [...(route?.stops || [])].sort((a, b) => (a.sequence || 0) - (b.sequence || 0)),
    [route]
  );
  const busCoordinates = bus?.currentLocation?.coordinates;
  const hasBusCoordinates = Array.isArray(busCoordinates) && busCoordinates.length === 2;

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: KIET_COORDINATES,
      zoom: 15.5
    });

    map.current.on('load', () => setMapReady(true));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapReady) return;

    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const points = [];
    const stopFeatures = stopList
      .filter(stop => Array.isArray(stop.location?.coordinates) && stop.location.coordinates.length === 2)
      .map((stop, index) => {
        points.push(stop.location.coordinates);
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: stop.location.coordinates
          },
          properties: {
            name: stop.name,
            index: index + 1
          }
        };
      });

    if (hasBusCoordinates) {
      points.push(busCoordinates);

      const el = document.createElement('div');
      el.className = 'flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg';
      el.innerHTML = '<span style="font-weight:700;font-size:12px;">BUS</span>';

      const marker = new maplibregl.Marker(el)
        .setLngLat(busCoordinates)
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(`
            <div style="padding:8px; font-size:12px;">
              <strong>${bus?.busNumber || 'Assigned Bus'}</strong><br/>
              Status: ${bus?.currentStatus || 'unknown'}<br/>
              Speed: ${bus?.currentSpeed || 0} km/h<br/>
              Occupancy: ${bus?.currentOccupancy || 0}/${bus?.capacity || 0}
            </div>
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    }

    stopFeatures.forEach(feature => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-md';
      wrapper.innerHTML = `<span style="font-weight:700;font-size:12px;">${feature.properties.index}</span>`;

      const marker = new maplibregl.Marker(wrapper)
        .setLngLat(feature.geometry.coordinates)
        .setPopup(
          new maplibregl.Popup({ offset: 12 }).setHTML(`
            <div style="padding:8px; font-size:12px;">
              <strong>Stop ${feature.properties.index}</strong><br/>
              ${feature.properties.name}
            </div>
          `)
        )
        .addTo(map.current);

      markersRef.current.push(marker);
    });

    const routeSourceData = {
      type: 'FeatureCollection',
      features: stopFeatures.length > 1 ? [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: stopFeatures.map(feature => feature.geometry.coordinates)
        },
        properties: {}
      }] : []
    };

    const routeSource = map.current.getSource('driver-route');

    if (routeSource) {
      routeSource.setData(routeSourceData);
    } else {
      map.current.addSource('driver-route', {
        type: 'geojson',
        data: routeSourceData
      });

      map.current.addLayer({
        id: 'driver-route-line',
        type: 'line',
        source: 'driver-route',
        paint: {
          'line-color': '#3b82f6',
          'line-width': 4,
          'line-opacity': 0.85
        }
      });
    }

    if (points.length > 0) {
      const bounds = points.reduce((acc, coordinates) => acc.extend(coordinates), new maplibregl.LngLatBounds(points[0], points[0]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 16.5, duration: 800 });
    } else {
      map.current.flyTo({ center: KIET_COORDINATES, zoom: 15.5, duration: 800 });
    }
  }, [bus, hasBusCoordinates, mapReady, route, stopList]);

  const lastUpdateText = bus?.lastLocationUpdate
    ? new Date(bus.lastLocationUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'No updates yet';

  const routeTitle = route?.routeNumber && route?.name
    ? `${route.routeNumber} - ${route.name}`
    : currentSchedule?.route?.name || 'No active route';

  return (
    <div className="relative h-full bg-card rounded-lg border border-border overflow-hidden">
      <div ref={mapContainer} className="relative h-full w-full" />

      <div className="absolute top-4 right-4 z-10">
        <MapNavigationController
          onZoomIn={() => map.current?.zoomIn()}
          onZoomOut={() => map.current?.zoomOut()}
          onCenter={() => {
            if (hasBusCoordinates) {
              map.current?.flyTo({ center: busCoordinates, zoom: 15.8, duration: 1000 });
            } else {
              map.current?.flyTo({ center: KIET_COORDINATES, zoom: 15.5, duration: 1000 });
            }
          }}
          showLayerToggle={false}
        />
      </div>

      <div className="absolute top-4 left-4 z-10 rounded-full border border-border bg-card/95 px-3 py-1 text-xs font-medium text-foreground shadow-card">
        {refreshing ? 'Refreshing...' : bus?.lastLocationUpdate ? `Last update ${lastUpdateText}` : 'Awaiting live location'}
      </div>

      <div className="absolute bottom-4 left-4 z-10 bg-card border border-border rounded-lg shadow-card p-3 min-w-[180px]">
        <div className="text-sm font-medium text-foreground">Assigned Bus</div>
        <div className="text-lg font-bold text-primary">{bus?.busNumber || 'Not Assigned'}</div>
        <div className="mt-2 text-xs text-muted-foreground">
          {hasBusCoordinates
            ? `${busCoordinates[1].toFixed(5)}, ${busCoordinates[0].toFixed(5)}`
            : 'Location unavailable'}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] bg-card border border-border rounded-lg shadow-modal">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-foreground">{routeTitle}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {currentSchedule
                  ? `${formatScheduleDate(currentSchedule.date)} | ${currentSchedule.startTime} - ${currentSchedule.endTime}`
                  : 'No active schedule'}
              </p>
            </div>
            <Icon name="Route" size={20} className="text-primary" />
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-semibold text-foreground capitalize">{bus?.currentStatus || 'idle'}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">Speed</p>
              <p className="text-sm font-semibold text-foreground">{bus?.currentSpeed || 0} km/h</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2">
              <p className="text-xs text-muted-foreground">Occupancy</p>
              <p className="text-sm font-semibold text-foreground">{bus?.currentOccupancy || 0}/{bus?.capacity || 0}</p>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stopList.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {bus?.busNumber ? 'No route stops available yet.' : 'Bus and route will appear here after assignment.'}
              </p>
            ) : (
              stopList.map((stop, index) => (
                <div key={stop._id || `${stop.name}-${index}`} className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{stop.name}</div>
                      <div className="text-xs text-muted-foreground">{stop.address || 'Campus stop'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stop.estimatedTime ? `+${stop.estimatedTime} min` : 'On route'}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-border flex justify-end">
            <Button size="sm" variant="outline" onClick={onRefreshLocation} loading={refreshLoading} disabled={!bus?._id && !bus?.id} iconName="LocateFixed">
              Refresh GPS
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteMapDisplay;
