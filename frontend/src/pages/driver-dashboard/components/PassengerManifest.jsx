import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PassengerManifest = () => {
  const [gpsEnabled, setGpsEnabled] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [passengerCount, setPassengerCount] = useState(12);

  const mockPassengers = [
    {
      id: 'p1',
      name: 'Rahul Sharma',
      studentId: 'KIET2021001',
      type: 'student',
      stop: 'Library Block',
      status: 'confirmed'
    },
    {
      id: 'p2',
      name: 'Dr. Priya Singh',
      employeeId: 'KIET2019F001',
      type: 'faculty',
      stop: 'Hostel Complex',
      status: 'onboard'
    },
    {
      id: 'p3',
      name: 'Amit Kumar',
      studentId: 'KIET2022003',
      type: 'student',
      stop: 'Sports Complex',
      status: 'waiting'
    },
    {
      id: 'p4',
      name: 'Sarah Johnson',
      studentId: 'KIET2021004',
      type: 'student',
      stop: 'Main Gate',
      status: 'onboard'
    },
    {
      id: 'p5',
      name: 'Prof. Rajesh Gupta',
      employeeId: 'KIET2018F002',
      type: 'faculty',
      stop: 'Library Block',
      status: 'confirmed'
    }
  ];

  const handleGPSToggle = () => {
    setGpsEnabled(!gpsEnabled);
  };

  const handleStatusToggle = () => {
    setIsOnline(!isOnline);
  };

  const handlePassengerCountChange = (increment) => {
    const newCount = Math.max(0, Math.min(50, passengerCount + increment));
    setPassengerCount(newCount);
  };

  const getPassengerStats = () => {
    const onboard = mockPassengers?.filter(p => p?.status === 'onboard')?.length;
    const waiting = mockPassengers?.filter(p => p?.status === 'waiting')?.length;
    const confirmed = mockPassengers?.filter(p => p?.status === 'confirmed')?.length;
    
    return { onboard, waiting, confirmed, total: mockPassengers?.length };
  };

  const stats = getPassengerStats();

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Passenger Summary</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-primary" />
            <span className="font-semibold text-foreground">{stats?.total}</span>
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="text-2xl font-bold text-success">{stats?.onboard}</div>
            <div className="text-xs text-success">Bus Onboard</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-2xl font-bold text-warning">{stats?.waiting}</div>
            <div className="text-xs text-warning">Waiting</div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">{stats?.confirmed}</div>
            <div className="text-xs text-primary">Confirmed</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg border border-border">
            <div className="text-2xl font-bold text-foreground">{stats?.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Driver Controls as Buttons */}
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Driver Controls</h3>
          
          {/* GPS Button */}
          <div className="mb-3">
            <Button
              variant={gpsEnabled ? 'default' : 'outline'}
              onClick={handleGPSToggle}
              className="w-full justify-start"
            >
              <Icon 
                name={gpsEnabled ? 'MapPin' : 'MapPinOff'} 
                size={16} 
                className="mr-2" 
              />
              GPS Sharing: {gpsEnabled ? 'ON' : 'OFF'}
            </Button>
          </div>

          {/* Online Status Button */}
          <div className="mb-3">
            <Button
              variant={isOnline ? 'default' : 'outline'}
              onClick={handleStatusToggle}
              className="w-full justify-start"
            >
              <Icon 
                name={isOnline ? 'Circle' : 'CircleOff'} 
                size={16} 
                className="mr-2" 
              />
              Driver Status: {isOnline ? 'Online' : 'Offline'}
            </Button>
          </div>

          {/* Passenger Count */}
          <div className="p-3 bg-muted/30 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} className="text-primary" />
                <span className="text-sm font-medium text-foreground">Passenger Count</span>
              </div>
              <div className="text-lg font-bold text-foreground">{passengerCount}</div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePassengerCountChange(-1)}
                disabled={passengerCount <= 0}
              >
                <Icon name="Minus" size={14} />
              </Button>
              <span className="text-sm text-muted-foreground">Current:</span>
              <span className="font-mono font-semibold text-foreground">{passengerCount}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePassengerCountChange(1)}
                disabled={passengerCount >= 50}
              >
                <Icon name="Plus" size={14} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PassengerManifest;