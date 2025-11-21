import React from 'react';
import Icon from '../../../components/AppIcon';

const BusMarker = ({ 
  bus, 
  isSelected, 
  onClick, 
  className = '' 
}) => {
  const getStatusColor = () => {
    switch (bus?.status) {
      case 'on_time':
        return 'bg-success text-success-foreground';
      case 'delayed':
        return 'bg-warning text-warning-foreground';
      case 'breakdown':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getCapacityColor = () => {
    const percentage = (bus?.currentCapacity / bus?.maxCapacity) * 100;
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <div 
      className={`relative cursor-pointer transform transition-all duration-200 ${
        isSelected ? 'scale-110 z-20' : 'hover:scale-105 z-10'
      } ${className}`}
      onClick={() => onClick(bus)}
    >
      {/* Bus Icon Container */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 
        ${getStatusColor()} 
        ${isSelected ? 'border-foreground' : 'border-white'}
      `}>
        <Icon name="Bus" size={20} />
      </div>
      {/* Route Number Badge */}
      <div className="absolute -top-2 -right-2 bg-card border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
        <span className="text-xs font-bold text-foreground">{bus?.routeNumber}</span>
      </div>
      {/* Capacity Indicator */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
        <div className="bg-card border border-border rounded-full px-2 py-0.5 shadow-sm">
          <span className={`text-xs font-medium ${getCapacityColor()}`}>
            {bus?.currentCapacity}/{bus?.maxCapacity}
          </span>
        </div>
      </div>
      {/* Status Pulse Animation */}
      {bus?.status === 'moving' && (
        <div className="absolute inset-0 rounded-full bg-primary opacity-30 animate-ping"></div>
      )}
    </div>
  );
};

export default BusMarker;