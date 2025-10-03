import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import SystemMetricsCard from './components/SystemMetricsCard';
import UserManagementPanel from './components/UserManagementPanel';
import RouteManagementPanel from './components/RouteManagementPanel';
import SystemMonitoringPanel from './components/SystemMonitoringPanel';
import FeedbackManagementPanel from './components/FeedbackManagementPanel';
import NotificationCenter from './components/NotificationCenter';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AdminManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const systemMetrics = [
    {
      title: "Active Buses",
      value: "12",
      change: 8.2,
      icon: "Bus",
      color: "primary"
    },
    {
      title: "Total Users",
      value: "1,247",
      change: 12.5,
      icon: "Users",
      color: "success"
    },
    {
      title: "Routes Operating",
      value: "4",
      change: 0,
      icon: "Route",
      color: "warning"
    },
    {
      title: "System Uptime",
      value: "99.8%",
      change: 0.3,
      icon: "Activity",
      color: "success"
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'users', label: 'Users', icon: 'Users' },
    { id: 'routes', label: 'Routes', icon: 'Route' },
    { id: 'monitoring', label: 'Monitoring', icon: 'Activity' },
    { id: 'feedback', label: 'Feedback', icon: 'MessageSquare' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* System Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {systemMetrics?.map((metric, index) => (
                <SystemMetricsCard
                  key={index}
                  title={metric?.title}
                  value={metric?.value}
                  change={metric?.change}
                  icon={metric?.icon}
                  color={metric?.color}
                />
              ))}
            </div>
            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-lg shadow-card">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="UserPlus"
                    iconSize={24}
                  >
                    <span>Add New User</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="Plus"
                    iconSize={24}
                  >
                    <span>Create Route</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="Bell"
                    iconSize={24}
                  >
                    <span>Send Alert</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="Download"
                    iconSize={24}
                  >
                    <span>Export Data</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="Settings"
                    iconSize={24}
                  >
                    <span>System Settings</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex-col space-y-2"
                    iconName="BarChart3"
                    iconSize={24}
                  >
                    <span>View Reports</span>
                  </Button>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-lg shadow-card">
              <div className="p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      icon: 'UserCheck',
                      title: 'New user registration approved',
                      description: 'Sarah Johnson (student) - Route 3',
                      time: '5 minutes ago',
                      color: 'text-success'
                    },
                    {
                      icon: 'AlertTriangle',
                      title: 'Route delay reported',
                      description: 'Route 3 - 15 minute delay due to traffic',
                      time: '12 minutes ago',
                      color: 'text-warning'
                    },
                    {
                      icon: 'MessageSquare',
                      title: 'New feedback received',
                      description: 'Complaint about bus cleanliness - Route 2',
                      time: '25 minutes ago',
                      color: 'text-primary'
                    },
                    {
                      icon: 'Settings',
                      title: 'System maintenance completed',
                      description: 'Database optimization and backup',
                      time: '1 hour ago',
                      color: 'text-success'
                    }
                  ]?.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                      <Icon name={activity?.icon} size={20} className={activity?.color} />
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{activity?.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity?.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity?.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'users':
        return <UserManagementPanel />;
      case 'routes':
        return <RouteManagementPanel />;
      case 'monitoring':
        return <SystemMonitoringPanel />;
      case 'feedback':
        return <FeedbackManagementPanel />;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Management</h1>
                <p className="text-muted-foreground">
                  Comprehensive system oversight and user management
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mb-8">
            <div className="border-b border-border">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-smooth ${
                      activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;