import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const RealTimeStatusIndicator = ({ className = '' }) => {
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Simulate WebSocket connection status
    const interval = setInterval(() => {
      const statuses = ['connected', 'connecting', 'disconnected'];
      const randomStatus = statuses?.[Math.floor(Math.random() * statuses?.length)];
      setConnectionStatus(randomStatus);
      
      if (randomStatus === 'connected') {
        setLastUpdate(new Date());
      }
    }, 5000);

    // Initial connection
    setTimeout(() => {
      setConnectionStatus('connected');
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          icon: 'Wifi',
          color: 'text-success',
          bgColor: 'bg-success/10',
          text: 'Live',
          pulse: false
        };
      case 'connecting':
        return {
          icon: 'Loader2',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          text: 'Connecting',
          pulse: true
        };
      case 'disconnected':
        return {
          icon: 'WifiOff',
          color: 'text-error',
          bgColor: 'bg-error/10',
          text: 'Offline',
          pulse: false
        };
      default:
        return {
          icon: 'Wifi',
          color: 'text-muted-foreground',
          bgColor: 'bg-muted',
          text: 'Unknown',
          pulse: false
        };
    }
  };

  const config = getStatusConfig();
  const formatTime = (date) => {
    if (!date) return '';
    return date?.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${config?.bgColor}`}>
        <div className={`${config?.pulse ? 'animate-spin' : ''}`}>
          <Icon 
            name={config?.icon} 
            size={12} 
            className={config?.color}
          />
        </div>
        <span className={`text-xs font-medium ${config?.color}`}>
          {config?.text}
        </span>
      </div>
      {lastUpdate && connectionStatus === 'connected' && (
        <span className="text-xs text-muted-foreground font-mono hidden sm:inline">
          {formatTime(lastUpdate)}
        </span>
      )}
    </div>
  );
};

export default RealTimeStatusIndicator;