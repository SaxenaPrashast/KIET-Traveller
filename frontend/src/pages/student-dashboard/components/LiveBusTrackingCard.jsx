import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RealTimeStatusIndicator from '../../../components/ui/RealTimeStatusIndicator';
import RouteMap from '../../route-preview/components/RouteMap';
import axios from 'axios';

const LiveBusTrackingCard = () => {

  const navigate = useNavigate();
  const { token } = useAuth();

  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchBus = async () => {
      try {

        const res = await axios.get(
          "http://localhost:5000/api/buses",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const buses = res.data.data.buses;

        if (buses.length > 0) {
          setBusData(buses[0]);
        }

      } catch (error) {
        console.error("Error fetching bus:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchBus();
    }

  }, [token]);

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card p-6">
        <p className="text-muted-foreground">Loading bus data...</p>
      </div>
    );
  }

  if (!busData) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card p-6">
        <p className="text-muted-foreground">No buses available</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">

      <div className="p-6 pb-4">

        <div className="flex items-center justify-between mb-4">

          <div className="flex items-center space-x-3">

            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <Icon name="Bus" size={24} className="text-primary" />
            </div>

            <div>
              <h3 className="font-semibold text-foreground">
                {busData.busNumber}
              </h3>

              <p className="text-sm text-muted-foreground">
                Active Campus Route
              </p>
            </div>

          </div>

          <RealTimeStatusIndicator />

        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Speed</p>
            <p className="text-sm font-medium text-foreground">
              {busData.currentSpeed || 0} km/h
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Status</p>
            <p className="text-sm font-medium text-success">
              {busData.currentStatus}
            </p>
          </div>

        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">

          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Occupancy</span>
          </div>

          <div className="flex items-center space-x-2">

            <span className={`text-sm font-medium ${getOccupancyColor(busData.currentOccupancy, busData.capacity)}`}>
              {busData.currentOccupancy}/{busData.capacity}
            </span>

            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">

              <div
                className="h-full bg-success"
                style={{
                  width: `${(busData.currentOccupancy / busData.capacity) * 100}%`
                }}
              />

            </div>

          </div>

        </div>

      </div>

      <div className="px-6 pb-4">

        <div className="rounded-lg overflow-hidden">

          <RouteMap
            selectedRoute="route-1"
            onStopClick={() => {}}
            shareLocationEnabled={false}
          />

        </div>

      </div>

      <div className="p-6 pt-0">

        <Button
          variant="outline"
          onClick={() => navigate('/route-preview')}
          iconName="Route"
          iconPosition="left"
          iconSize={16}
          className="w-full"
        >
          Route Details
        </Button>

      </div>

    </div>
  );
};

export default LiveBusTrackingCard;