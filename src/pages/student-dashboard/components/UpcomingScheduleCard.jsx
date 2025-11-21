import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const UpcomingScheduleCard = () => {
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // NEW: dropdown open/close state
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Simulated schedule data
    const mockSchedules = [
      {
        id: 1,
        busNumber: 'KIET-01',
        route: 'Main Campus → Hostel Block',
        departureTime: '08:30',
        arrivalTime: '08:45',
        stops: ['Academic Block A', 'Library', 'Cafeteria', 'Hostel Block'],
        status: 'on_time',
        occupancy: 28,
        capacity: 45
      },
      {
        id: 2,
        busNumber: 'KIET-03',
        route: 'Hostel Block → Main Campus',
        departureTime: '09:15',
        arrivalTime: '09:30',
        stops: ['Hostel Block', 'Sports Complex', 'Academic Block B', 'Main Gate'],
        status: 'delayed',
        occupancy: 35,
        capacity: 45
      },
      {
        id: 3,
        busNumber: 'KIET-02',
        route: 'Main Campus → City Center',
        departureTime: '17:30',
        arrivalTime: '18:15',
        stops: ['Main Gate', 'Metro Station', 'Shopping Mall', 'City Center'],
        status: 'on_time',
        occupancy: 12,
        capacity: 45
      }
    ];

    setSchedules(mockSchedules);
  }, [selectedDate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time': return 'text-success bg-success/10';
      case 'delayed': return 'text-warning bg-warning/10';
      case 'early': return 'text-primary bg-primary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on_time': return 'On Time';
      case 'delayed': return 'Delayed';
      case 'early': return 'Early';
      default: return 'Unknown';
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today?.toDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">

      {/* HEADER — clickable dropdown */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between hover:bg-muted/20 transition-smooth"
      >
        <div className="flex items-center space-x-3">
          <h2 className="text-lg font-semibold text-foreground">Upcoming Schedule</h2>
          <span className="text-sm text-muted-foreground">
            {isToday(selectedDate) ? 'Today' : formatDate(selectedDate)}
          </span>
        </div>

        <Icon
          name={isOpen ? "ChevronUp" : "ChevronDown"}
          size={20}
          className="text-muted-foreground transition-transform"
        />
      </button>

      {/* COLLAPSIBLE CONTENT */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-6 pt-0 space-y-4">

          {schedules?.map((schedule) => (
            <div key={schedule.id} className="border border-border rounded-lg p-4 hover:bg-muted/20 transition-smooth">
              
              {/* Bus Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <Icon name="Bus" size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">{schedule.busNumber}</h3>
                    <p className="text-sm text-muted-foreground">{schedule.route}</p>
                  </div>
                </div>

                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                  {getStatusText(schedule.status)}
                </div>
              </div>

              {/* Times + Occupancy */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="flex items-center space-x-2">
                  <Icon name="Clock" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {schedule.departureTime} - {schedule.arrivalTime}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon name="Users" size={14} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">
                    {schedule.occupancy}/{schedule.capacity}
                  </span>
                </div>
              </div>

              {/* Stops + Reminder */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {schedule.stops.length} stops
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Bell"
                  iconSize={14}
                  onClick={() => alert(`Reminder set for ${schedule.busNumber}`)}
                >
                  Set Reminder
                </Button>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Occupancy</span>
                  <span>{Math.round((schedule.occupancy / schedule.capacity) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      (schedule.occupancy / schedule.capacity) >= 0.9 ? 'bg-error'
                      : (schedule.occupancy / schedule.capacity) >= 0.7 ? 'bg-warning'
                      : 'bg-success'
                    }`}
                    style={{ width: `${(schedule.occupancy / schedule.capacity) * 100}%` }}
                  />
                </div>
              </div>

            </div>
          ))}

          {/* Buttons */}
          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Calendar"
              iconSize={14}
              className="flex-1"
            >
              View Full Schedule
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="RefreshCw"
              iconSize={14}
            >
              Refresh
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default UpcomingScheduleCard;
