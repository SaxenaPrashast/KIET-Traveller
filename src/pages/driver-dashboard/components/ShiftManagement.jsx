import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ShiftManagement = () => {
  const [shiftStatus, setShiftStatus] = useState('active');
  const [shiftStartTime, setShiftStartTime] = useState(new Date(Date.now() - 2 * 60 * 60 * 1000));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mockShiftData = {
    driverName: 'Rajesh Kumar',
    driverId: 'DRV001',
    vehicleNumber: 'UP 16 AB 1234',
    routeAssigned: 'Route 3 - Main Campus',
    shiftType: 'Morning',
    scheduledStart: '08:00',
    scheduledEnd: '12:00',
    breakTime: '10:00 - 10:15'
  };

  const getShiftDuration = () => {
    const duration = currentTime - shiftStartTime;
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getShiftStatusColor = () => {
    switch (shiftStatus) {
      case 'active':
        return 'text-success bg-success/10 border-success';
      case 'break':
        return 'text-warning bg-warning/10 border-warning';
      case 'ended':
        return 'text-muted-foreground bg-muted border-border';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const handleShiftAction = (action) => {
    switch (action) {
      case 'start-break':
        setShiftStatus('break');
        break;
      case 'end-break':
        setShiftStatus('active');
        break;
      case 'end-shift':
        setShiftStatus('ended');
        break;
      default:
        break;
    }
  };

  const inspectionItems = [
    { id: 'brakes', label: 'Brake System', checked: true },
    { id: 'lights', label: 'Lights & Indicators', checked: true },
    { id: 'tires', label: 'Tire Condition', checked: false },
    { id: 'fuel', label: 'Fuel Level', checked: true },
    { id: 'doors', label: 'Door Operation', checked: true },
    { id: 'seats', label: 'Seat Condition', checked: false }
  ];

  const completedInspections = inspectionItems?.filter(item => item?.checked)?.length;
  const inspectionProgress = (completedInspections / inspectionItems?.length) * 100;

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Shift Management</h2>
          <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getShiftStatusColor()}`}>
            {shiftStatus?.charAt(0)?.toUpperCase() + shiftStatus?.slice(1)}
          </div>
        </div>

        {/* Driver Information */}
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Driver</div>
              <div className="font-medium text-foreground">{mockShiftData?.driverName}</div>
              <div className="text-xs text-muted-foreground font-mono">{mockShiftData?.driverId}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Vehicle</div>
              <div className="font-medium text-foreground">{mockShiftData?.vehicleNumber}</div>
              <div className="text-xs text-muted-foreground">{mockShiftData?.routeAssigned}</div>
            </div>
          </div>
        </div>

        {/* Shift Timing */}
        <div className="mb-6">
          <h3 className="font-medium text-foreground mb-3">Shift Timing</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted/30 rounded-lg border border-border">
              <div className="text-sm text-muted-foreground">Scheduled</div>
              <div className="font-mono font-medium text-foreground">
                {mockShiftData?.scheduledStart} - {mockShiftData?.scheduledEnd}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Break: {mockShiftData?.breakTime}
              </div>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-sm text-primary">Current Duration</div>
              <div className="font-mono font-bold text-primary text-lg">
                {getShiftDuration()}
              </div>
              <div className="text-xs text-primary mt-1">
                Started: {shiftStartTime?.toLocaleTimeString('en-US', { hour12: false })}
              </div>
            </div>
          </div>
        </div>

        {/* Shift Controls */}
        <div className="mb-6">
          <h3 className="font-medium text-foreground mb-3">Shift Controls</h3>
          <div className="space-y-2">
            {shiftStatus === 'active' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleShiftAction('start-break')}
                  iconName="Coffee"
                  iconPosition="left"
                  iconSize={16}
                  fullWidth
                >
                  Start Break
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleShiftAction('end-shift')}
                  iconName="LogOut"
                  iconPosition="left"
                  iconSize={16}
                  fullWidth
                >
                  End Shift
                </Button>
              </div>
            )}
            
            {shiftStatus === 'break' && (
              <Button
                variant="default"
                onClick={() => handleShiftAction('end-break')}
                iconName="Play"
                iconPosition="left"
                iconSize={16}
                fullWidth
              >
                Resume Shift
              </Button>
            )}
            
            {shiftStatus === 'ended' && (
              <div className="text-center py-4">
                <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-2" />
                <p className="text-success font-medium">Shift Completed</p>
                <p className="text-sm text-muted-foreground">Thank you for your service today</p>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Inspection */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Vehicle Inspection</h3>
            <div className="flex items-center space-x-2">
              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${inspectionProgress}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {completedInspections}/{inspectionItems?.length}
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {inspectionItems?.map((item) => (
              <div
                key={item?.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border"
              >
                <span className="text-sm text-foreground">{item?.label}</span>
                <div className="flex items-center space-x-2">
                  {item?.checked ? (
                    <Icon name="CheckCircle" size={16} className="text-success" />
                  ) : (
                    <Icon name="Circle" size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <Button
              variant="outline"
              iconName="FileText"
              iconPosition="left"
              iconSize={16}
              fullWidth
              disabled={inspectionProgress < 100}
            >
              Complete Inspection Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;