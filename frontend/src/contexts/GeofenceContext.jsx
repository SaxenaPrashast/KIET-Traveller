import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';

const GeofenceContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

export const GeofenceProvider = ({ children }) => {
  const { user, token } = useAuth();
  const socketRef = useRef(null);

  // Geofence config state
  const [config, setConfig] = useState({
    enabled: false,
    radius: 500,
    assignedStopId: null,
    assignedRouteId: null,
    assignedStopName: null
  });
  const [configLoading, setConfigLoading] = useState(true);

  // Available stops for selection
  const [availableStops, setAvailableStops] = useState([]);
  const [stopsLoading, setStopsLoading] = useState(false);

  // Active alerts queue
  const [alerts, setAlerts] = useState([]);
  const [latestAlert, setLatestAlert] = useState(null);

  // Connection status
  const [isConnected, setIsConnected] = useState(false);

  // Fetch geofence config from backend
  const fetchConfig = useCallback(async () => {
    if (!token) return;
    try {
      setConfigLoading(true);
      const res = await axios.get(`${API_BASE}/tracking/geofence/config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data?.geofence) {
        setConfig(res.data.data.geofence);
      }
    } catch (err) {
      console.error('Failed to fetch geofence config:', err);
    } finally {
      setConfigLoading(false);
    }
  }, [token]);

  // Update geofence config
  const updateConfig = useCallback(async (updates) => {
    if (!token) return;
    try {
      const res = await axios.put(`${API_BASE}/tracking/geofence/config`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data?.geofence) {
        setConfig(res.data.data.geofence);
      }
      return res.data;
    } catch (err) {
      console.error('Failed to update geofence config:', err);
      throw err;
    }
  }, [token]);

  // Fetch available stops
  const fetchStops = useCallback(async () => {
    if (!token) return;
    try {
      setStopsLoading(true);
      const res = await axios.get(`${API_BASE}/tracking/geofence/stops`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.data?.stops) {
        setAvailableStops(res.data.data.stops);
      }
    } catch (err) {
      console.error('Failed to fetch stops:', err);
    } finally {
      setStopsLoading(false);
    }
  }, [token]);

  // Dismiss a specific alert
  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  // Clear all alerts
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLatestAlert(null);
  }, []);

  // Setup socket connection
  useEffect(() => {
    if (!token || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('🌐 Geofence socket connected');

      // Subscribe to geofence if configured
      if (config.assignedStopId) {
        socket.emit('subscribeGeofence', { stopId: config.assignedStopId });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for geofence alerts
    socket.on('geofenceAlert', (data) => {
      const alertWithId = {
        ...data,
        id: `${data.busId}_${data.stop?.id}_${Date.now()}`,
        receivedAt: new Date()
      };

      setAlerts((prev) => {
        // Keep max 5 alerts
        const updated = [alertWithId, ...prev].slice(0, 5);
        return updated;
      });

      setLatestAlert(alertWithId);

      // Play notification sound
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (e) {
        // Audio not available
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, user]);

  // Re-subscribe when config changes
  useEffect(() => {
    if (socketRef.current?.connected && config.assignedStopId) {
      socketRef.current.emit('subscribeGeofence', { stopId: config.assignedStopId });
    }
  }, [config.assignedStopId]);

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const value = {
    config,
    configLoading,
    updateConfig,
    fetchConfig,
    availableStops,
    stopsLoading,
    fetchStops,
    alerts,
    latestAlert,
    dismissAlert,
    clearAlerts,
    isConnected
  };

  return (
    <GeofenceContext.Provider value={value}>
      {children}
    </GeofenceContext.Provider>
  );
};

export const useGeofence = () => {
  const context = useContext(GeofenceContext);
  if (!context) {
    throw new Error('useGeofence must be used within a GeofenceProvider');
  }
  return context;
};

export default GeofenceContext;
