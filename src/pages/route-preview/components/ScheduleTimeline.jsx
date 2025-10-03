import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ScheduleTimeline = ({ selectedRoute }) => {
  const [selectedDay, setSelectedDay] = useState('today');
  const [viewMode, setViewMode] = useState('timeline');

  const scheduleData = {
    'route-1': {
      today: [
        { time: '06:00', status: 'completed', delay: 0, occupancy: 'low' },
        { time: '06:15', status: 'completed', delay: 2, occupancy: 'medium' },
        { time: '06:30', status: 'completed', delay: 0, occupancy: 'high' },
        { time: '06:45', status: 'completed', delay: 1, occupancy: 'medium' },
        { time: '07:00', status: 'completed', delay: 0, occupancy: 'high' },
        { time: '07:15', status: 'completed', delay: 3, occupancy: 'high' },
        { time: '07:30', status: 'completed', delay: 1, occupancy: 'medium' },
        { time: '07:45', status: 'active', delay: 0, occupancy: 'medium' },
        { time: '08:00', status: 'upcoming', delay: 0, occupancy: 'medium' },
        { time: '08:15', status: 'upcoming', delay: 0, occupancy: 'low' },
        { time: '08:30', status: 'upcoming', delay: 0, occupancy: 'medium' },
        { time: '08:45', status: 'upcoming', delay: 0, occupancy: 'high' }
      ]
    }
  };

  const dayOptions = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: 'weekdays', label: 'Weekdays' },
    { value: 'weekends', label: 'Weekends' }
  ];

  const currentSchedule = scheduleData?.[selectedRoute]?.today || scheduleData?.['route-1']?.today;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'completed':
        return { 
          color: 'text-muted-foreground', 
          bg: 'bg-muted', 
          icon: 'CheckCircle',
          text: 'Completed'
        };
      case 'active':
        return { 
          color: 'text-primary', 
          bg: 'bg-primary/10', 
          icon: 'Navigation',
          text: 'In Transit'
        };
      case 'upcoming':
        return { 
          color: 'text-success', 
          bg: 'bg-success/10', 
          icon: 'Clock',
          text: 'Scheduled'
        };
      default:
        return { 
          color: 'text-muted-foreground', 
          bg: 'bg-muted', 
          icon: 'Circle',
          text: 'Unknown'
        };
    }
  };

  const getOccupancyConfig = (occupancy) => {
    switch (occupancy) {
      case 'low':
        return { color: 'text-success', bg: 'bg-success/10', text: 'Low', icon: 'Users' };
      case 'medium':
        return { color: 'text-warning', bg: 'bg-warning/10', text: 'Medium', icon: 'Users' };
      case 'high':
        return { color: 'text-error', bg: 'bg-error/10', text: 'High', icon: 'Users' };
      default:
        return { color: 'text-muted-foreground', bg: 'bg-muted', text: 'Unknown', icon: 'Users' };
    }
  };

  const getDelayText = (delay) => {
    if (delay === 0) return 'On time';
    return `+${delay} min`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Schedule Timeline</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'timeline' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('timeline')}
              iconName="Clock"
              iconSize={14}
            >
              Timeline
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              iconName="Grid"
              iconSize={14}
            >
              Grid
            </Button>
          </div>
        </div>

        <div className="flex space-x-2 overflow-x-auto">
          {dayOptions?.map((day) => (
            <Button
              key={day?.value}
              variant={selectedDay === day?.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedDay(day?.value)}
              className="whitespace-nowrap"
            >
              {day?.label}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-4">
        {viewMode === 'timeline' ? (
          <div className="space-y-4">
            {currentSchedule?.map((schedule, index) => {
              const statusConfig = getStatusConfig(schedule?.status);
              const occupancyConfig = getOccupancyConfig(schedule?.occupancy);
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-current">
                    <Icon 
                      name={statusConfig?.icon} 
                      size={16} 
                      className={statusConfig?.color}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="font-mono text-lg font-semibold text-foreground">
                          {schedule?.time}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.bg} ${statusConfig?.color}`}>
                          {statusConfig?.text}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {getDelayText(schedule?.delay)}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${occupancyConfig?.bg} ${occupancyConfig?.color}`}>
                          {occupancyConfig?.text}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentSchedule?.map((schedule, index) => {
              const statusConfig = getStatusConfig(schedule?.status);
              const occupancyConfig = getOccupancyConfig(schedule?.occupancy);
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-center ${statusConfig?.bg} ${
                    schedule?.status === 'active' ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="font-mono text-sm font-semibold text-foreground mb-1">
                    {schedule?.time}
                  </div>
                  <div className={`text-xs ${statusConfig?.color} mb-2`}>
                    {statusConfig?.text}
                  </div>
                  <div className={`text-xs px-1 py-0.5 rounded ${occupancyConfig?.bg} ${occupancyConfig?.color}`}>
                    {occupancyConfig?.text}
                  </div>
                  {schedule?.delay > 0 && (
                    <div className="text-xs text-warning mt-1">
                      +{schedule?.delay}m
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success rounded-full"></div>
              <span className="text-muted-foreground">On Schedule</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-warning rounded-full"></div>
              <span className="text-muted-foreground">Delayed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">Active</span>
            </div>
          </div>
          <span className="text-muted-foreground">
            Last updated: {new Date()?.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimeline;