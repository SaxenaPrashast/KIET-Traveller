import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import RealTimeStatusIndicator from '../../../components/ui/RealTimeStatusIndicator';

const LiveBusTrackingCard = () => {
  const navigate = useNavigate();
  const [busData, setBusData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching live bus data
    const fetchBusData = () => {
      setTimeout(() => {
        setBusData({
          busNumber: "KIET-03",
          routeName: "Main Campus - Hostel Route",
          currentLocation: "Near Library Block",
          eta: "5 mins",
          nextStop: "Academic Block A",
          coordinates: { lat: 28.7041, lng: 77.1025 },
          occupancy: 32,
          capacity: 45,
          status: "on_time"
        });
        setLoading(false);
      }, 1500);
    };

    fetchBusData();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setBusData(prev => prev ? {
        ...prev,
        eta: Math.max(1, parseInt(prev?.eta) - 1) + " mins",
        occupancy: Math.min(45, prev?.occupancy + Math.floor(Math.random() * 3) - 1)
      } : null);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on_time': return 'text-success';
      case 'delayed': return 'text-warning';
      case 'early': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getOccupancyColor = (occupancy, capacity) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'text-error';
    if (percentage >= 70) return 'text-warning';
    return 'text-success';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
            <div>
              <div className="w-24 h-4 bg-muted rounded animate-pulse mb-2"></div>
              <div className="w-32 h-3 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
          <div className="w-16 h-6 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="w-full h-48 bg-muted rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg shadow-card overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
              <Icon name="Bus" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{busData?.busNumber}</h3>
              <p className="text-sm text-muted-foreground">{busData?.routeName}</p>
            </div>
          </div>
          <RealTimeStatusIndicator />
        </div>

        {/* Status Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Current Location</p>
            <p className="text-sm font-medium text-foreground">{busData?.currentLocation}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">ETA to Next Stop</p>
            <p className={`text-sm font-medium ${getStatusColor(busData?.status)}`}>
              {busData?.eta}
            </p>
          </div>
        </div>

        {/* Occupancy */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Occupancy</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${getOccupancyColor(busData?.occupancy, busData?.capacity)}`}>
              {busData?.occupancy}/{busData?.capacity}
            </span>
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  (busData?.occupancy / busData?.capacity) >= 0.9 ? 'bg-error' :
                  (busData?.occupancy / busData?.capacity) >= 0.7 ? 'bg-warning' : 'bg-success'
                }`}
                style={{ width: `${(busData?.occupancy / busData?.capacity) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Map Preview */}
      <div className="px-6 pb-4">
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            loading="lazy"
            title="Live Bus Location"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${busData?.coordinates?.lat},${busData?.coordinates?.lng}&z=15&output=embed`}
            className="border-0"
          />
          <div className="absolute top-2 right-2 bg-card/90 backdrop-blur-sm border border-border rounded-lg px-2 py-1">
            <span className="text-xs font-medium text-foreground">Live</span>
          </div>
        </div>
      </div>
      {/* Actions */}
      <div className="p-6 pt-0 flex space-x-3">
        <Button
          variant="outline"
          onClick={() => navigate('/route-preview')}
          iconName="Route"
          iconPosition="left"
          iconSize={16}
          className="flex-1"
        >
          Route Details
        </Button>
      </div>
    </div>
  );
};

export default LiveBusTrackingCard;