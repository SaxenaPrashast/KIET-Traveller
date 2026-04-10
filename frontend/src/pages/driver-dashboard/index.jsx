import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config/constants';

import RouteMapDisplay from './components/RouteMapDisplay';
import PassengerManifest from './components/PassengerManifest';
import ShiftManagement from './components/ShiftManagement';

const getLocalDateKey = (value) => {
  if (!value) return '';

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getScheduleDateTime = (schedule, timeField = 'startTime') => {
  const dateKey = getLocalDateKey(schedule?.date);
  if (!dateKey) return null;

  const timeValue = schedule?.[timeField] || '00:00';
  return new Date(`${dateKey}T${timeValue}`);
};

const isActiveScheduleStatus = (status) => ['in_progress', 'delayed'].includes(status);
const isUpcomingScheduleStatus = (status) => ['scheduled', 'in_progress', 'delayed'].includes(status);

const formatScheduleDate = (value) => {
  if (!value) return 'No schedule';
  return new Date(value).toLocaleDateString([], {
    day: '2-digit',
    month: 'short'
  });
};

const DriverDashboard = () => {
  const { token } = useAuth();

  const [driver, setDriver] = useState(null);
  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [liveSchedule, setLiveSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [routesCount, setRoutesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`
  }), [token]);

  const assignedBusId = driver?.assignedBus?._id || driver?.assignedBus || null;

  const loadDashboard = async (showLoader = false) => {
    if (!token) return;

    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      setError('');

      const meRes = await axios.get(`${API_BASE}/auth/me`, { headers });
      const freshDriver = meRes.data?.data?.user || null;
      setDriver(freshDriver);

      const freshBusId = freshDriver?.assignedBus?._id || freshDriver?.assignedBus || null;

      let fetchedSchedules = [];
      let busData = freshDriver?.assignedBus || null;
      let inProgressSchedule = null;

      const [scheduleResult, busStatusResult, routeResult] = await Promise.allSettled([
        freshDriver?._id
          ? axios.get(`${API_BASE}/schedules?driver=${freshDriver._id}&limit=100&sort=date&order=asc`, { headers })
          : Promise.resolve({ data: { data: { schedules: [] } } }),
        freshBusId
          ? axios.get(`${API_BASE}/tracking/bus/${freshBusId}/status`, { headers })
          : Promise.resolve({ data: { data: { bus: freshDriver?.assignedBus || null, currentSchedule: null } } }),
        axios.get(`${API_BASE}/routes?limit=100`, { headers })
      ]);

      if (scheduleResult.status === 'fulfilled') {
        fetchedSchedules = scheduleResult.value?.data?.data?.schedules || [];
      }

      if (busStatusResult.status === 'fulfilled') {
        busData = busStatusResult.value?.data?.data?.bus || busData;
        inProgressSchedule = busStatusResult.value?.data?.data?.currentSchedule || null;
      }

      if (routeResult.status === 'fulfilled') {
        const allRoutes = routeResult.value?.data?.data?.routes || [];
        setRoutesCount(routeResult.value?.data?.data?.pagination?.total || allRoutes.length || 0);

        if (freshBusId) {
          const assignedRoute = allRoutes.find((item) =>
            (item.assignedBuses || []).some((assignedBus) => assignedBus?._id === freshBusId)
          );

          if (assignedRoute) {
            busData = {
              ...busData,
              currentRoute: assignedRoute
            };
          }
        }
      }

      let currentRoute = busData?.currentRoute || null;
      const primarySchedule = fetchedSchedules[0] || null;
      const routeId = currentRoute?._id
        || inProgressSchedule?.route?._id
        || primarySchedule?.route?._id
        || null;

      if ((!currentRoute || !Array.isArray(currentRoute?.stops) || currentRoute.stops.length === 0) && routeId && /^[a-f\d]{24}$/i.test(routeId)) {
        try {
          const routeRes = await axios.get(`${API_BASE}/routes/${routeId}`, { headers });
          currentRoute = routeRes.data?.data?.route || null;
        } catch (routeError) {
          console.warn('Unable to fetch driver route details:', routeError);
        }
      }

      const normalizedSchedules = fetchedSchedules.sort((a, b) => {
        const aDate = getScheduleDateTime(a) || new Date(0);
        const bDate = getScheduleDateTime(b) || new Date(0);
        return aDate - bDate;
      });

      const mergedSchedules = [...normalizedSchedules];
      if (inProgressSchedule && !mergedSchedules.some(schedule => schedule._id === inProgressSchedule._id)) {
        mergedSchedules.unshift(inProgressSchedule);
      }

      setDriver(freshDriver);
      setBus(busData);
      setRoute(currentRoute);
      setLiveSchedule(inProgressSchedule);
      setSchedules(mergedSchedules);
    } catch (err) {
      console.error('Driver dashboard error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load driver dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadDashboard(true);
    const interval = setInterval(() => loadDashboard(false), 15000);

    return () => clearInterval(interval);
  }, [token]);

  const busSchedules = useMemo(() => {
    const busId = bus?._id || bus?.id || assignedBusId;
    if (!busId) return [];

    return schedules
      .filter(schedule => {
      const scheduleBusId = schedule?.bus?._id || schedule?.bus;
      return scheduleBusId === busId;
      })
      .sort((a, b) => {
        const aDate = getScheduleDateTime(a) || new Date(0);
        const bDate = getScheduleDateTime(b) || new Date(0);
        return aDate - bDate;
      });
  }, [assignedBusId, bus, schedules]);

  const todayDateKey = getLocalDateKey(new Date());

  const todaysSchedule = useMemo(() => {
    const todaysBusSchedules = busSchedules.filter((schedule) => {
      return getLocalDateKey(schedule?.date) === todayDateKey && schedule?.status !== 'cancelled';
    });

    return todaysBusSchedules.find((schedule) => isActiveScheduleStatus(schedule?.status))
      || todaysBusSchedules.find((schedule) => schedule?.status === 'scheduled')
      || todaysBusSchedules[0]
      || null;
  }, [busSchedules, todayDateKey]);

  const currentSchedule = useMemo(() => {
    if (liveSchedule) {
      const liveMatch = busSchedules.find(schedule => schedule._id === liveSchedule._id) || liveSchedule;
      const liveBusId = liveMatch?.bus?._id || liveMatch?.bus;

      if (!assignedBusId || !liveBusId || liveBusId === assignedBusId) {
        return liveMatch;
      }
    }

    return todaysSchedule
      || busSchedules.find((schedule) => {
        return isUpcomingScheduleStatus(schedule?.status) && getScheduleDateTime(schedule) >= new Date();
      })
      || busSchedules.find((schedule) => schedule?.status !== 'cancelled')
      || null;
  }, [assignedBusId, busSchedules, liveSchedule, todaysSchedule]);

  const nextSchedule = useMemo(() => {
    const currentStart = currentSchedule ? getScheduleDateTime(currentSchedule) : null;

    return busSchedules.find((schedule) => {
      if (schedule?._id === currentSchedule?._id || schedule?.status === 'cancelled') return false;

      const scheduleStart = getScheduleDateTime(schedule);
      if (!scheduleStart) return false;

      if (currentStart) {
        return scheduleStart > currentStart;
      }

      return scheduleStart >= new Date();
    }) || null;
  }, [busSchedules, currentSchedule]);

  const topSummary = useMemo(() => {
    const assignedRoute = route?.name || currentSchedule?.route?.name || todaysSchedule?.route?.name || nextSchedule?.route?.name || 'Not Assigned';
    const todaysScheduleLabel = todaysSchedule
      ? `${formatScheduleDate(todaysSchedule.date)} | ${todaysSchedule.startTime} - ${todaysSchedule.endTime}`
      : 'No schedule';

    return [
      { label: 'Driver Name', value: driver?.fullName || `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim() || 'Unknown', icon: 'User' },
      { label: 'Assigned Bus', value: bus?.busNumber || driver?.assignedBus?.busNumber || 'Not Assigned', icon: 'Bus' },
      { label: 'Assigned Route', value: assignedRoute, icon: 'Route' },
      { label: "Today's Schedule", value: todaysScheduleLabel, icon: 'CalendarDays' },
      { label: 'Active Bus', value: bus?.status === 'active' ? '1' : '0', icon: 'Activity' },
      { label: 'Total Routes', value: String(routesCount || 0), icon: 'Map' },
      {
        label: 'Upcoming Schedules',
        value: String(
          busSchedules.filter((schedule) => {
            const scheduleStart = getScheduleDateTime(schedule);
            return isUpcomingScheduleStatus(schedule?.status) && scheduleStart && scheduleStart >= new Date();
          }).length
        ),
        icon: 'Clock3'
      }
    ];
  }, [bus, busSchedules, currentSchedule, driver, nextSchedule, route, routesCount, todaysSchedule]);

  const getCoordinates = () => {
    return new Promise((resolve, reject) => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          },
          () => {
            const coords = bus?.currentLocation?.coordinates;
            if (Array.isArray(coords) && coords.length === 2) {
              resolve({
                latitude: coords[1],
                longitude: coords[0]
              });
            } else {
              reject(new Error('Location access unavailable'));
            }
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        const coords = bus?.currentLocation?.coordinates;
        if (Array.isArray(coords) && coords.length === 2) {
          resolve({ latitude: coords[1], longitude: coords[0] });
        } else {
          reject(new Error('Geolocation is not supported'));
        }
      }
    });
  };

  const updateTracking = async ({ occupancy } = {}) => {
    if (!assignedBusId) {
      throw new Error('No assigned bus found for this driver');
    }

    const coords = await getCoordinates();

    await axios.put(
      `${API_BASE}/tracking/bus/${assignedBusId}/location`,
      {
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: bus?.currentSpeed || 0,
        occupancy: occupancy !== undefined ? occupancy : bus?.currentOccupancy
      },
      { headers }
    );
  };

  const handleRefreshLocation = async () => {
    setActionLoading('location');
    try {
      await updateTracking();
      await loadDashboard(false);
    } catch (err) {
      console.error('Location refresh failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to refresh location');
    } finally {
      setActionLoading('');
    }
  };

  const handleScheduleAction = async (action, payload = {}) => {
    if (!currentSchedule?._id) {
      setError('No schedule available for this action');
      return;
    }

    setActionLoading(action);

    try {
      switch (action) {
        case 'start':
          await axios.put(`${API_BASE}/schedules/${currentSchedule._id}/start`, {}, { headers });
          break;
        case 'complete':
          await axios.put(`${API_BASE}/schedules/${currentSchedule._id}/complete`, {}, { headers });
          break;
        case 'cancel':
          await axios.put(`${API_BASE}/schedules/${currentSchedule._id}/cancel`, payload, { headers });
          break;
        case 'delay':
          await axios.put(`${API_BASE}/schedules/${currentSchedule._id}/delay`, payload, { headers });
          break;
        default:
          return;
      }

      await loadDashboard(false);
    } catch (err) {
      console.error(`Schedule ${action} failed:`, err);
      setError(err.response?.data?.message || `Failed to ${action} trip`);
    } finally {
      setActionLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="px-3 sm:px-4 lg:px-6 pb-6">
          {error && (
            <div className="mb-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
              Loading driver dashboard...
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3">
                {topSummary.map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-card px-4 py-3 shadow-card min-h-[92px]">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <Icon name={item.icon} size={16} className="text-primary shrink-0" />
                    </div>
                    <p className="mt-3 text-sm sm:text-base font-semibold leading-5 text-foreground break-words">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                  <ShiftManagement
                    driver={driver}
                    bus={bus}
                    route={route}
                    currentSchedule={currentSchedule}
                    nextSchedule={nextSchedule}
                  />

                  <div className="h-64 sm:h-80 lg:h-[500px]">
                    <RouteMapDisplay
                      bus={bus}
                      route={route}
                      currentSchedule={currentSchedule}
                      refreshing={refreshing}
                      onRefreshLocation={handleRefreshLocation}
                      refreshLoading={actionLoading === 'location'}
                    />
                  </div>
                </div>

                <div className="space-y-4 lg:space-y-6">
                  <PassengerManifest
                    bus={bus}
                    currentSchedule={currentSchedule}
                    actionLoading={actionLoading}
                    onStartTrip={() => handleScheduleAction('start')}
                    onCompleteTrip={() => handleScheduleAction('complete')}
                    onCancelTrip={(reason) => handleScheduleAction('cancel', { reason })}
                    onRefreshLocation={handleRefreshLocation}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
