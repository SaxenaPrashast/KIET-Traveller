import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const formatDateTime = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
};

const formatScheduleDate = (value) => {
  if (!value) return 'N/A';
  return new Date(value).toLocaleDateString([], {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const ShiftManagement = ({ driver, bus, route, currentSchedule, nextSchedule }) => {
  const [expandedDriver, setExpandedDriver] = useState(true);
  const [expandedVehicle, setExpandedVehicle] = useState(true);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Assignment Details</h2>

        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setExpandedDriver(!expandedDriver)}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-3">
              <Icon name="User" size={20} className="text-primary" />
              <span className="font-medium">Driver Information</span>
            </div>
            <Icon name={expandedDriver ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-muted-foreground" />
          </Button>

          {expandedDriver && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Driver Name</div>
                  <div className="font-medium text-foreground">{driver?.fullName || `${driver?.firstName || ''} ${driver?.lastName || ''}`.trim() || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Email</div>
                  <div className="font-medium text-foreground">{driver?.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Phone</div>
                  <div className="font-medium text-foreground">{driver?.phone || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">License</div>
                  <div className="font-medium text-foreground">{driver?.driverLicense || 'N/A'}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setExpandedVehicle(!expandedVehicle)}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Truck" size={20} className="text-primary" />
              <span className="font-medium">Vehicle Information</span>
            </div>
            <Icon name={expandedVehicle ? 'ChevronUp' : 'ChevronDown'} size={20} className="text-muted-foreground" />
          </Button>

          {expandedVehicle && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Assigned Bus</div>
                  <div className="font-medium text-foreground">{bus?.busNumber || driver?.assignedBus?.busNumber || 'Not Assigned'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Registration</div>
                  <div className="font-medium text-foreground">{bus?.registrationNumber || driver?.assignedBus?.registrationNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Capacity</div>
                  <div className="font-medium text-foreground">{bus?.capacity ? `${bus.capacity} seats` : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Route Assigned</div>
                  <div className="font-medium text-foreground">
                    {route?.routeNumber && route?.name
                      ? `${route.routeNumber} - ${route.name}`
                      : currentSchedule?.route?.name || nextSchedule?.route?.name || 'No route assigned'}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Last Location Update</div>
                  <div className="font-medium text-foreground">{formatDateTime(bus?.lastLocationUpdate)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/20 p-4">
          <h3 className="font-medium text-foreground mb-3">Shift Snapshot</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current Trip</span>
              <span className="font-medium text-foreground text-right">{currentSchedule?.route?.name || 'No active schedule'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current Window</span>
              <span className="font-medium text-foreground text-right">{currentSchedule ? `${currentSchedule.startTime} - ${currentSchedule.endTime}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Current Date</span>
              <span className="font-medium text-foreground text-right">{formatScheduleDate(currentSchedule?.date)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Next Trip</span>
              <span className="font-medium text-foreground text-right">{nextSchedule?.route?.name || 'No next trip'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Next Window</span>
              <span className="font-medium text-foreground text-right">{nextSchedule ? `${nextSchedule.startTime} - ${nextSchedule.endTime}` : 'N/A'}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Next Date</span>
              <span className="font-medium text-foreground text-right">{formatScheduleDate(nextSchedule?.date)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;
