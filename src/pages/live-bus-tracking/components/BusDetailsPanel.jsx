import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BusDetailsPanel = ({ 
  selectedBus, 
  onClose, 
  onSetReminder, 
  onShareLocation,
  className = '' 
}) => {
  if (!selectedBus) return null;

  const getStatusConfig = () => {
    switch (selectedBus?.status) {
      case 'on_time':
        return {
          color: 'text-success',
          bgColor: 'bg-success/10',
          icon: 'CheckCircle',
          text: 'On Time'
        };
      case 'delayed':
        return {
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          icon: 'Clock',
          text: `Delayed by ${selectedBus?.delayMinutes}min`
        };
      case 'breakdown':
        return {
          color: 'text-error',
          bgColor: 'bg-error/10',
          icon: 'AlertTriangle',
          text: 'Service Disruption'
        };
      default:
        return {
          color: 'text-primary',
          bgColor: 'bg-primary/10',
          icon: 'Navigation',
          text: 'In Transit'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const capacityPercentage = (selectedBus?.currentCapacity / selectedBus?.maxCapacity) * 100;

  const formatETA = (eta) => {
    if (eta < 60) return `${eta}min`;
    const hours = Math.floor(eta / 60);
    const minutes = eta % 60;
    return `${hours}h ${minutes}min`;
  };

  return (
    <div className={`bg-card border-t border-border shadow-modal ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Icon name="Bus" size={20} color="white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Route {selectedBus?.routeNumber}</h3>
            <p className="text-sm text-muted-foreground">{selectedBus?.routeName}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden"
        >
          <Icon name="X" size={20} />
        </Button>
      </div>
      {/* Status and ETA */}
      <div className="p-4 space-y-4">
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${statusConfig?.bgColor}`}>
          <Icon name={statusConfig?.icon} size={16} className={statusConfig?.color} />
          <span className={`text-sm font-medium ${statusConfig?.color}`}>
            {statusConfig?.text}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name="Clock" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Next Stop ETA</span>
            </div>
            <p className="font-semibold text-foreground">{formatETA(selectedBus?.nextStopETA)}</p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Icon name="Users" size={14} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Capacity</span>
            </div>
            <p className="font-semibold text-foreground">
              {selectedBus?.currentCapacity}/{selectedBus?.maxCapacity}
            </p>
          </div>
        </div>

        {/* Capacity Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Occupancy</span>
            <span>{Math.round(capacityPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                capacityPercentage >= 90 ? 'bg-error' : 
                capacityPercentage >= 70 ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${capacityPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Next Stops */}
        <div className="space-y-2">
          <h4 className="font-medium text-foreground flex items-center space-x-2">
            <Icon name="MapPin" size={16} />
            <span>Upcoming Stops</span>
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedBus?.upcomingStops?.map((stop, index) => (
              <div key={stop?.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    index === 0 ? 'bg-primary' : 'bg-muted-foreground'
                  }`}></div>
                  <span className="text-sm text-foreground">{stop?.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatETA(stop?.eta)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onSetReminder(selectedBus)}
            iconName="Bell"
            iconPosition="left"
            iconSize={16}
          >
            Set Reminder
          </Button>
          <Button
            variant="outline"
            onClick={() => onShareLocation(selectedBus)}
            iconName="Share"
            iconPosition="left"
            iconSize={16}
          >
            Share Location
          </Button>
        </div>

        {/* Driver Info */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Icon name="User" size={16} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{selectedBus?.driver?.name}</p>
              <p className="text-xs text-muted-foreground">Driver • {selectedBus?.driver?.experience} years exp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetailsPanel;