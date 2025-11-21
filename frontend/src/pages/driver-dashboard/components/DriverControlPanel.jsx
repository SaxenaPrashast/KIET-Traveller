import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DriverControlPanel = ({ onGPSToggle }) => {
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [passengerCount, setPassengerCount] = useState(12);
  const [isOnline, setIsOnline] = useState(true);

  const handleGPSToggle = () => {
    const newState = !gpsEnabled;
    setGpsEnabled(newState);
    onGPSToggle?.(newState);
  };

  const handlePassengerCountChange = (increment) => {
    const newCount = Math.max(0, Math.min(50, passengerCount + increment));
    setPassengerCount(newCount);
  };

  const handleStatusToggle = () => {
    setIsOnline(!isOnline);
  };

  const controlItems = [
    {
      id: 'gps',
      title: 'GPS Sharing',
      description: 'Share location with passengers',
      icon: gpsEnabled ? 'MapPin' : 'MapPinOff',
      status: gpsEnabled,
      action: handleGPSToggle,
      color: gpsEnabled ? 'text-success' : 'text-error'
    },
    {
      id: 'status',
      title: 'Driver Status',
      description: isOnline ? 'Online & Active' : 'Offline',
      icon: isOnline ? 'Circle' : 'CircleOff',
      status: isOnline,
      action: handleStatusToggle,
      color: isOnline ? 'text-success' : 'text-muted-foreground'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Driver Controls</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Active Session</span>
          </div>
        </div>

        {/* Status Controls */}
        <div className="space-y-4 mb-6">
          {controlItems?.map((item) => (
            <div
              key={item?.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center space-x-3">
                <Icon name={item?.icon} size={20} className={item?.color} />
                <div>
                  <div className="font-medium text-foreground">{item?.title}</div>
                  <div className="text-sm text-muted-foreground">{item?.description}</div>
                </div>
              </div>
              <Button
                variant={item?.status ? 'default' : 'outline'}
                size="sm"
                onClick={item?.action}
              >
                {item?.status ? 'ON' : 'OFF'}
              </Button>
            </div>
          ))}
        </div>

        {/* Passenger Counter */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={20} className="text-primary" />
              <span className="font-medium text-foreground">Passenger Count</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{passengerCount}</div>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePassengerCountChange(-1)}
              disabled={passengerCount <= 0}
            >
              <Icon name="Minus" size={16} />
            </Button>
            <div className="flex items-center space-x-2 px-4">
              <span className="text-sm text-muted-foreground">Current:</span>
              <span className="font-mono text-lg font-semibold text-foreground">{passengerCount}</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePassengerCountChange(1)}
              disabled={passengerCount >= 50}
            >
              <Icon name="Plus" size={16} />
            </Button>
          </div>
        </div>

        {/* Current Time */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Time:</span>
            <span className="font-mono font-medium text-foreground">
              {new Date()?.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Shift Duration:</span>
            <span className="font-mono font-medium text-foreground">2h 45m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverControlPanel;