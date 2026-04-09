import React from 'react';
import Icon from '../../../components/AppIcon';

const MyTransportCard = ({ user, buses = [], schedules = [] }) => {
  const assignedBusId = user?.assignedBus?._id || user?.assignedBus || null;

  const nextBus = assignedBusId
    ? buses.find(bus => bus._id === assignedBusId) || user?.assignedBus || null
    : buses.length > 0
      ? buses[0]
      : null;

  const nextSchedule = assignedBusId
    ? schedules.find(schedule => {
        const scheduleBusId = schedule.bus?._id || schedule.bus;
        return scheduleBusId === assignedBusId;
      }) || schedules[0] || null
    : schedules.length > 0
      ? schedules[0]
      : null;

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My Transport</h3>
        <Icon name="Bus" size={20} className="text-primary" />
      </div>

      {/* 🚍 BUS INFO */}
      {nextBus ? (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Active Bus</p>
          <p className="font-medium">{nextBus.busNumber}</p>
          <p className="text-xs text-muted-foreground">
            Speed: {nextBus.currentSpeed || 0} km/h
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          No active bus right now
        </p>
      )}

      {/* 📅 SCHEDULE INFO */}
      {nextSchedule ? (
        <div>
          <p className="text-sm text-muted-foreground">Next Trip</p>
          <p className="font-medium">
            {nextSchedule.route?.name || "Route"}
          </p>
          <p className="text-xs text-muted-foreground">
            {nextSchedule.startTime} → {nextSchedule.endTime}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No upcoming schedule
        </p>
      )}

    </div>
  );
};

export default MyTransportCard;
