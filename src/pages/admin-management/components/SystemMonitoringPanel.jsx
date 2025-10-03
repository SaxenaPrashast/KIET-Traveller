import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SystemMonitoringPanel = () => {
  const [systemStatus, setSystemStatus] = useState({
    server: 'online',
    database: 'online',
    websocket: 'online',
    gps: 'warning',
    notifications: 'online'
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      message: 'GPS accuracy below 85% for Route 3',
      timestamp: new Date(Date.now() - 300000),
      resolved: false
    },
    {
      id: 2,
      type: 'info',
      message: 'System maintenance scheduled for tonight at 2:00 AM',
      timestamp: new Date(Date.now() - 600000),
      resolved: false
    },
    {
      id: 3,
      type: 'success',
      message: 'Database backup completed successfully',
      timestamp: new Date(Date.now() - 900000),
      resolved: true
    }
  ]);

  useEffect(() => {
    // Simulate real-time status updates
    const interval = setInterval(() => {
      setSystemStatus(prev => ({
        ...prev,
        gps: Math.random() > 0.7 ? 'warning' : 'online'
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'offline':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'offline':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-l-success bg-success/5';
      case 'warning':
        return 'border-l-warning bg-warning/5';
      case 'error':
        return 'border-l-error bg-error/5';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'success':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'error':
        return 'XCircle';
      default:
        return 'Info';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return timestamp?.toLocaleDateString();
    }
  };

  const resolveAlert = (alertId) => {
    setAlerts(prev => prev?.map(alert => 
      alert?.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  return (
    <div className="space-y-6">
      {/* System Status */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">System Status</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(systemStatus)?.map(([service, status]) => (
              <div key={service} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Icon 
                    name={getStatusIcon(status)} 
                    size={20} 
                    className={getStatusColor(status)}
                  />
                  <div>
                    <p className="font-medium text-foreground capitalize">
                      {service === 'websocket' ? 'WebSocket' : service}
                    </p>
                    <p className={`text-sm capitalize ${getStatusColor(status)}`}>
                      {status}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  status === 'online' ? 'bg-success' : 
                  status === 'warning' ? 'bg-warning' : 'bg-error'
                }`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Performance Metrics */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Performance Metrics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Icon name="Zap" size={24} className="text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">99.8%</p>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Icon name="Activity" size={24} className="text-success mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">1,247</p>
              <p className="text-sm text-muted-foreground">Active Connections</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Icon name="Clock" size={24} className="text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">120ms</p>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Icon name="Database" size={24} className="text-error mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">2.4GB</p>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </div>
      </div>
      {/* System Alerts */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">System Alerts</h3>
            <Button variant="outline" size="sm" iconName="RefreshCw" iconPosition="left">
              Refresh
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {alerts?.map((alert) => (
              <div 
                key={alert?.id} 
                className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert?.type)} ${
                  alert?.resolved ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon 
                      name={getAlertIcon(alert?.type)} 
                      size={20} 
                      className={`mt-0.5 ${
                        alert?.type === 'success' ? 'text-success' :
                        alert?.type === 'warning' ? 'text-warning' :
                        alert?.type === 'error' ? 'text-error' : 'text-primary'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {alert?.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimestamp(alert?.timestamp)}
                      </p>
                    </div>
                  </div>
                  {!alert?.resolved && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => resolveAlert(alert?.id)}
                      iconName="Check"
                      iconPosition="left"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemMonitoringPanel;