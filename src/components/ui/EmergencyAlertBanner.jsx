import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const EmergencyAlertBanner = ({ className = '' }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  useEffect(() => {
    // Simulate emergency alerts
    const mockAlerts = [
      {
        id: 'alert-1',
        type: 'emergency',
        title: 'Service Disruption',
        message: 'Route 3 delayed by 15 minutes due to traffic congestion on Main Street.',
        timestamp: new Date(),
        priority: 'high'
      },
      {
        id: 'alert-2',
        type: 'maintenance',
        title: 'Scheduled Maintenance',
        message: 'Bus tracking system will be offline for maintenance from 2:00 AM to 4:00 AM.',
        timestamp: new Date(Date.now() + 3600000),
        priority: 'medium'
      }
    ];

    // Simulate receiving alerts
    setTimeout(() => {
      setAlerts(mockAlerts);
    }, 2000);
  }, []);

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertConfig = (type, priority) => {
    if (type === 'emergency' || priority === 'high') {
      return {
        bgColor: 'bg-error',
        textColor: 'text-error-foreground',
        icon: 'AlertTriangle',
        borderColor: 'border-error'
      };
    } else if (priority === 'medium') {
      return {
        bgColor: 'bg-warning',
        textColor: 'text-warning-foreground',
        icon: 'Info',
        borderColor: 'border-warning'
      };
    } else {
      return {
        bgColor: 'bg-primary',
        textColor: 'text-primary-foreground',
        icon: 'Bell',
        borderColor: 'border-primary'
      };
    }
  };

  const visibleAlerts = alerts?.filter(alert => !dismissedAlerts?.has(alert?.id));

  if (visibleAlerts?.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {visibleAlerts?.map((alert) => {
        const config = getAlertConfig(alert?.type, alert?.priority);
        
        return (
          <div
            key={alert?.id}
            className={`${config?.bgColor} ${config?.textColor} border-l-4 ${config?.borderColor} shadow-card`}
          >
            <div className="flex items-start justify-between p-4">
              <div className="flex items-start space-x-3 flex-1">
                <Icon 
                  name={config?.icon} 
                  size={20} 
                  className={`${config?.textColor} mt-0.5 flex-shrink-0`}
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-semibold text-sm ${config?.textColor}`}>
                    {alert?.title}
                  </h4>
                  <p className={`text-sm ${config?.textColor} mt-1 opacity-90`}>
                    {alert?.message}
                  </p>
                  <div className={`text-xs ${config?.textColor} opacity-75 mt-2 font-mono`}>
                    {alert?.timestamp?.toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDismiss(alert?.id)}
                className={`${config?.textColor} hover:bg-black/10 flex-shrink-0 ml-2`}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmergencyAlertBanner;