import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ShiftManagement = () => {
  const [expandedDriver, setExpandedDriver] = useState(false);
  const [expandedVehicle, setExpandedVehicle] = useState(false);

  const mockShiftData = {
    driverName: 'Rajesh Kumar',
    driverId: 'DRV001',
    vehicleNumber: 'UP 16 AB 1234',
    routeAssigned: 'Route 3 - Main Campus',
    vehicleModel: 'Tata AC Bus',
    capacity: '50 Seats'
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Driver & Vehicle</h2>

        {/* Driver Information Button */}
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
            <Icon 
              name={expandedDriver ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              className="text-muted-foreground" 
            />
          </Button>
          
          {expandedDriver && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border animate-in fade-in">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Driver Name</div>
                  <div className="font-medium text-foreground">{mockShiftData?.driverName}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Driver ID</div>
                  <div className="font-mono text-sm text-foreground">{mockShiftData?.driverId}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Vehicle Information Button */}
        <div>
          <Button
            variant="outline"
            onClick={() => setExpandedVehicle(!expandedVehicle)}
            className="w-full justify-between"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Truck" size={20} className="text-primary" />
              <span className="font-medium">Vehicle Information</span>
            </div>
            <Icon 
              name={expandedVehicle ? "ChevronUp" : "ChevronDown"} 
              size={20} 
              className="text-muted-foreground" 
            />
          </Button>
          
          {expandedVehicle && (
            <div className="mt-3 p-4 bg-muted/30 rounded-lg border border-border animate-in fade-in">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-sm text-muted-foreground">Registration</div>
                  <div className="font-medium text-foreground">{mockShiftData?.vehicleNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Model</div>
                  <div className="font-medium text-foreground">{mockShiftData?.vehicleModel}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Capacity</div>
                  <div className="font-medium text-foreground">{mockShiftData?.capacity}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Route Assigned</div>
                  <div className="font-medium text-foreground">{mockShiftData?.routeAssigned}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftManagement;