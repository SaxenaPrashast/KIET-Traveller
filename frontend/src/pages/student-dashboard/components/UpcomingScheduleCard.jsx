import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingScheduleCard = ({ schedules = [] }) => {

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const visibleSchedules = schedules.filter(schedule => {
    if (!schedule.date) return true;
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    scheduleDate.setHours(0, 0, 0, 0);
    return scheduleDate >= today;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-success bg-success/10';
      case 'delayed': return 'text-warning bg-warning/10';
      case 'in_progress': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'scheduled': return 'Scheduled';
      case 'delayed': return 'Delayed';
      case 'in_progress': return 'In Progress';
      default: return 'Unknown';
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">

      {/* HEADER */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-smooth"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground">
            Upcoming Schedule
          </h2>
          <span className="text-sm text-muted-foreground">
            {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
          </span>
        </div>

        <Icon
          name={isOpen ? "ChevronUp" : "ChevronDown"}
          size={20}
          className="text-muted-foreground"
        />
      </button>

      {/* CONTENT */}
      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 pt-0 space-y-4">

          {visibleSchedules.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No schedules available
            </p>
          ) : (
            visibleSchedules.map((schedule) => (
              <div key={schedule._id} className="border border-border rounded-lg p-4">

                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    {schedule.bus?.busNumber || 'Bus'}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded ${getStatusColor(schedule.status)}`}>
                    {getStatusText(schedule.status)}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {schedule.route?.name || 'Route'}
                </p>

                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(new Date(schedule.date))}
                </p>

                <p className="text-sm mt-1">
                  {schedule.startTime} - {schedule.endTime}
                </p>

              </div>
            ))
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1">
              View Full Schedule
            </Button>
            <Button variant="ghost" size="sm">
              Refresh
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpcomingScheduleCard;
