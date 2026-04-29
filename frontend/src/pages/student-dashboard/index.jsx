import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/ui/Header';

import LiveBusTrackingCard from './components/LiveBusTrackingCard';
import UpcomingScheduleCard from './components/UpcomingScheduleCard';
import Announcements from './components/Announcements';
import MyTransportCard from './components/MyTransportCard';
import DashboardStats from './components/DashboardStats';
import GeofenceSettings from './components/GeofenceSettings';
import GeofenceAlertCard from '../../components/GeofenceAlertCard';

const StudentDashboard = () => {
  const { user, token } = useAuth();

  const [liveBuses, setLiveBuses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [currentUser, setCurrentUser] = useState(user);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null); // ✅ STEP 8

  useEffect(() => {
    let interval;

    const fetchDashboardData = async () => {
      try {
        const userRes = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const freshUser = userRes.data.data.user;
        const assignedBusId = freshUser?.assignedBus?._id || freshUser?.assignedBus;
        const today = new Date();
        const todayString = today.toISOString().split("T")[0];

        const [busRes, scheduleRes] = await Promise.all([
          axios.get("http://localhost:5000/api/tracking/live", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/schedules?startDate=${todayString}${assignedBusId ? `&bus=${assignedBusId}` : ""}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setCurrentUser(freshUser);
        setLiveBuses(busRes.data.data.buses || []);
        setSchedules(scheduleRes.data.data.schedules || []);

        setLastUpdated(new Date()); // ✅ STEP 8

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();

      // 🔥 auto refresh
      interval = setInterval(fetchDashboardData, 5000);
    }

    return () => clearInterval(interval);

  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto p-6">

          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              Welcome back, {user?.firstName}
              <DashboardStats />
            </h1>

            <p className="text-muted-foreground">
              Real-time campus transport dashboard
            </p>

            {/* ✅ STEP 8: LAST UPDATED */}
            {lastUpdated && (
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">

              {/* LEFT */}
              <div className="lg:col-span-2 space-y-6">

                {/* 🌐 Geofence Alerts */}
                <GeofenceAlertCard />

                {/* 🚍 Live Bus */}
                {liveBuses.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">
                      No active buses right now
                    </p>
                  </div>
                ) : (
                  <LiveBusTrackingCard bus={liveBuses[0]} />
                )}

                {/* 📅 Schedule */}
                {schedules.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground">
                      No schedules available (Admin not added yet)
                    </p>
                  </div>
                ) : (
                  <UpcomingScheduleCard schedules={schedules} />
                )}

              </div>

              {/* RIGHT */}
              <div className="space-y-6">

                {/* 📡 Geofence Settings */}
                <GeofenceSettings />

                {/* 🧠 Smart Card */}
                <MyTransportCard 
                  user={currentUser}
                  buses={liveBuses} 
                  schedules={schedules} 
                />

                {/* 📢 Announcements */}
                <Announcements />

              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
