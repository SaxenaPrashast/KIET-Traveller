import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import SystemMetricsCard from './components/SystemMetricsCard';
import UserManagementPanel from './components/UserManagementPanel';
import RouteManagementPanel from './components/RouteManagementPanel';
import NotificationCenter from './components/NotificationCenter';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { API_BASE } from '../../config/constants';
import BusManagementPanel from './components/BusManagementPanel';
import ScheduleManagementPanel from './components/ScheduleManagementPanel';

const AdminManagement = () => {

  const [activeTab, setActiveTab] = useState('overview');

  const { token } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {

    const fetchDashboard = async () => {

      try {

        const res = await fetch(`${API_BASE}/admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();

        if (data.success) {
          setDashboardData(data.data.overview);
        }

      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }

    };

    if (token) fetchDashboard();

  }, [token]);

  const systemMetrics = [

    {
      title: "Active Buses",
      value: dashboardData?.buses?.activeBuses ?? 0,
      icon: "Bus",
      color: "primary"
    },

    {
      title: "Total Users",
      value: dashboardData?.users?.totalUsers ?? 0,
      icon: "Users",
      color: "success"
    },

    {
      title: "Routes Operating",
      value: dashboardData?.routes?.activeRoutes ?? 0,
      icon: "Route",
      color: "warning"
    },

    {
      title: "Total Drivers",
      value: dashboardData?.users?.roleCounts?.filter(r => r.role === "driver").length ?? 0,
      icon: "UserCheck",
      color: "primary"
    },

    {
      title: "Schedules",
      value: dashboardData?.schedules?.totalSchedules ?? 0,
      icon: "Calendar",
      color: "success"
    }

  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'routes', label: 'Routes', icon: 'Route' },
    { id: 'buses', label: 'Buses', icon: 'Bus' },
    { id: 'schedules', label: 'Schedules', icon: 'Calendar' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' }
  ];

  const renderTabContent = () => {

    switch (activeTab) {

      case 'overview':
        return (

          <div className="space-y-6">

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

              {systemMetrics.map((metric, index) => (

                <SystemMetricsCard
                  key={index}
                  title={metric.title}
                  value={metric.value}
                  icon={metric.icon}
                  color={metric.color}
                />

              ))}

            </div>

            {/* System Summary */}
            <div className="bg-card border border-border rounded-lg shadow-card p-6">

              <h3 className="text-lg font-semibold text-foreground mb-4">
                System Overview
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Icon name="Bus" size={22} className="mx-auto text-primary mb-2"/>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboardData?.buses?.activeBuses ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active Buses
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Icon name="Users" size={22} className="mx-auto text-success mb-2"/>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboardData?.users?.totalUsers ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Registered Users
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Icon name="Route" size={22} className="mx-auto text-warning mb-2"/>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboardData?.routes?.activeRoutes ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Active Routes
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Icon name="UserCheck" size={22} className="mx-auto text-primary mb-2"/>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboardData?.users?.roleCounts?.filter(r => r.role === "driver").length ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Drivers
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <Icon name="Calendar" size={22} className="mx-auto text-success mb-2"/>
                  <p className="text-lg font-semibold text-foreground">
                    {dashboardData?.schedules?.totalSchedules ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Schedules
                  </p>
                </div>

              </div>

            </div>

          </div>

        );

      case 'users':
        return <UserManagementPanel />;

      case 'routes':
        return <RouteManagementPanel />;

      case 'buses':
        return <BusManagementPanel />;

      case 'schedules':
        return <ScheduleManagementPanel />;

      case 'notifications':
        return <NotificationCenter />;

      default:
        return null;

    }

  };

  return (

    <div className="min-h-screen bg-background">

      <Header />

      <div className="pt-16">

        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

          {/* Title */}
          <div className="mb-8 flex items-center space-x-3">

            <div className="p-2 bg-primary/10 rounded-lg">
              <Icon name="Shield" size={24} className="text-primary" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Admin Management
              </h1>
              <p className="text-muted-foreground">
                Comprehensive system oversight and user management
              </p>
            </div>

          </div>

          {/* Tabs */}
          <div className="border-b border-border mb-8">

            <nav className="flex space-x-6">

              {tabs.map(tab => (

                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 border-b-2 text-sm ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground'
                  }`}
                >

                  <Icon name={tab.icon} size={16} />

                  <span>{tab.label}</span>

                </button>

              ))}

            </nav>

          </div>

          {/* Tab Content */}
          {renderTabContent()}

        </div>

      </div>

    </div>

  );

};

export default AdminManagement;
