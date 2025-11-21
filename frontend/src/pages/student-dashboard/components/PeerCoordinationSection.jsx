import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PeerCoordinationSection = () => {
  const [peers, setPeers] = useState([]);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [myLocation, setMyLocation] = useState(null);

  useEffect(() => {
    // Simulate fetching peer data
    const mockPeers = [
      {
        id: 1,
        name: 'Sarah Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        location: 'Academic Block A',
        busRoute: 'KIET-01',
        eta: '5 mins',
        status: 'waiting',
        lastSeen: new Date(Date.now() - 120000)
      },
      {
        id: 2,
        name: 'Mike Chen',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        location: 'Library',
        busRoute: 'KIET-03',
        eta: '8 mins',
        status: 'walking',
        lastSeen: new Date(Date.now() - 60000)
      },
      {
        id: 3,
        name: 'Emily Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
        location: 'Hostel Block',
        busRoute: 'KIET-02',
        eta: '12 mins',
        status: 'boarding',
        lastSeen: new Date(Date.now() - 30000)
      }
    ];

    setPeers(mockPeers);
  }, []);

  const handleLocationShare = () => {
    if (!isLocationSharing) {
      // Simulate getting user location
      setIsLocationSharing(true);
      setTimeout(() => {
        setMyLocation({
          lat: 28.7041,
          lng: 77.1025,
          address: 'Near Cafeteria'
        });
      }, 1000);
    } else {
      setIsLocationSharing(false);
      setMyLocation(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'waiting': return 'text-warning bg-warning/10';
      case 'walking': return 'text-primary bg-primary/10';
      case 'boarding': return 'text-success bg-success/10';
      case 'traveling': return 'text-secondary bg-secondary/10';
      default: return 'text-muted-foreground bg-muted/10';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'waiting': return 'Clock';
      case 'walking': return 'Footprints';
      case 'boarding': return 'LogIn';
      case 'traveling': return 'Bus';
      default: return 'User';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'walking': return 'Walking';
      case 'boarding': return 'Boarding';
      case 'traveling': return 'Traveling';
      default: return 'Unknown';
    }
  };

  const formatLastSeen = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-foreground">Peer Coordination</h2>
          <Icon name="Users" size={16} className="text-muted-foreground" />
        </div>
        <Button
          variant={isLocationSharing ? "default" : "outline"}
          size="sm"
          onClick={handleLocationShare}
          iconName={isLocationSharing ? "MapPin" : "Share"}
          iconSize={14}
          loading={isLocationSharing && !myLocation}
        >
          {isLocationSharing ? 'Sharing' : 'Share Location'}
        </Button>
      </div>
      {/* My Location Status */}
      {myLocation && (
        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="MapPin" size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">You are sharing your location</p>
              <p className="text-xs text-muted-foreground">{myLocation?.address}</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      {/* Peers List */}
      <div className="space-y-3">
        {peers?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Users" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No peers sharing location</p>
          </div>
        ) : (
          peers?.map((peer) => (
            <div key={peer?.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg hover:bg-muted/20 transition-smooth">
              <div className="relative">
                <img
                  src={peer?.avatar}
                  alt={peer?.name}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${getStatusColor(peer?.status)?.replace('text-', 'bg-')?.replace(' bg-', ' ')}`}>
                  <Icon name={getStatusIcon(peer?.status)} size={8} className="text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground truncate">{peer?.name}</h4>
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatLastSeen(peer?.lastSeen)}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <Icon name="MapPin" size={12} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground truncate">{peer?.location}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(peer?.status)}`}>
                      {getStatusText(peer?.status)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {peer?.busRoute} • {peer?.eta}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Messaging ${peer?.name}`)}
                      iconName="MessageCircle"
                      iconSize={12}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => alert(`Viewing ${peer?.name}'s location`)}
                      iconName="Eye"
                      iconSize={12}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Group coordination feature coming soon!')}
            iconName="Users"
            iconSize={14}
          >
            Create Group
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Nearby peers feature coming soon!')}
            iconName="Radar"
            iconSize={14}
          >
            Find Nearby
          </Button>
        </div>
      </div>
      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={14} className="text-muted-foreground mt-0.5" />
          <div>
            <p className="text-xs text-muted-foreground">
              Your location is only shared with your selected peers and automatically stops sharing after 2 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeerCoordinationSection;