export const API_BASE = 'http://localhost:5000/api';

export const MAPLIBRE_STYLE = {
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

export const KIET_COORDINATES = [77.4977, 28.7520]; // KIET coordinates [longitude, latitude]

export const USER_ROLES = {
  ADMIN: 'admin',
  STUDENT: 'student',
  DRIVER: 'driver',
  STAFF: 'staff'
};

export const DASHBOARD_PATHS = {
  [USER_ROLES.ADMIN]: '/admin-management',
  [USER_ROLES.STUDENT]: '/student-dashboard',
  [USER_ROLES.DRIVER]: '/driver-dashboard',
  [USER_ROLES.STAFF]: '/student-dashboard'
};
