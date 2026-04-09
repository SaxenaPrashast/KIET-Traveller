import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const DashboardStats = () => {
  const { token } = useAuth();

  const [stats, setStats] = useState({
    activeBuses: 0,
    routes: 0,
    schedules: 0,
    notifications: 0
  });

  useEffect(() => {

    const fetchStats = async () => {
      try {

        const headers = {
          Authorization: `Bearer ${token}`
        };

        const [busRes, routeRes, scheduleRes, notifRes] = await Promise.all([
          axios.get("http://localhost:5000/api/buses", { headers }),
          axios.get("http://localhost:5000/api/routes", { headers }),
          axios.get("http://localhost:5000/api/schedules", { headers }),
          axios.get("http://localhost:5000/api/notifications", { headers })
        ]);

        const buses = busRes.data.data.buses || [];
        const routes = routeRes.data.data.routes || [];
        const schedules = scheduleRes.data.data.schedules || [];
        const notifications = notifRes.data.data.notifications || [];

        const active = buses.filter(
          b => b.status === "active" || b.currentStatus === "active" || b.currentStatus === "running"
        );

        setStats({
          activeBuses: active.length,
          routes: routes.length,
          schedules: schedules.length,
          notifications: notifications.length
        });

      } catch (err) {
        console.error("Stats error:", err);
      }
    };

    if (token) fetchStats();

  }, [token]);

  const StatCard = ({ icon, label, value }) => (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-3">
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
        <Icon name={icon} size={20} className="text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

      <StatCard icon="Bus" label="Active Buses" value={stats.activeBuses} />
      <StatCard icon="Route" label="Routes" value={stats.routes} />
      <StatCard icon="Calendar" label="Schedules" value={stats.schedules} />
      <StatCard icon="Bell" label="Notifications" value={stats.notifications} />

    </div>
  );
};

export default DashboardStats;
