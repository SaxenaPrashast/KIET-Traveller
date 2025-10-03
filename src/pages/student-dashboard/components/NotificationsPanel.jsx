import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      {
        id: 1,
        type: 'delay',
        title: 'Route Delay Alert',
        message: 'KIET-03 is running 10 minutes late due to traffic congestion.',
        timestamp: new Date(Date.now() - 300000),
        read: false,
        priority: 'high'
      },
      {
        id: 2,
        type: 'arrival',
        title: 'Bus Approaching',
        message: 'KIET-01 will arrive at Academic Block A in 3 minutes.',
        timestamp: new Date(Date.now() - 600000),
        read: false,
        priority: 'medium'
      },
      {
        id: 3,
        type: 'route_change',
        title: 'Route Update',
        message: 'Temporary route change for KIET-02 due to construction work.',
        timestamp: new Date(Date.now() - 1800000),
        read: true,
        priority: 'medium'
      },
      {
        id: 4,
        type: 'maintenance',
        title: 'Service Notice',
        message: 'Bus tracking system maintenance scheduled for tonight 2:00-4:00 AM.',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        priority: 'low'
      },
      {
        id: 5,
        type: 'feedback',
        title: 'Feedback Response',
        message: 'Thank you for your feedback. Issue has been resolved.',
        timestamp: new Date(Date.now() - 7200000),
        read: true,
        priority: 'low'
      }
    ];

    setNotifications(mockNotifications);
  }, []);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'delay': return 'Clock';
      case 'arrival': return 'MapPin';
      case 'route_change': return 'Route';
      case 'maintenance': return 'Settings';
      case 'feedback': return 'MessageSquare';
      default: return 'Bell';
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return 'text-error bg-error/10';
    if (type === 'arrival') return 'text-success bg-success/10';
    if (type === 'delay') return 'text-warning bg-warning/10';
    return 'text-primary bg-primary/10';
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev?.map(notif =>
        notif?.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadCount = notifications?.filter(n => !n?.read)?.length;
  const displayNotifications = showAll ? notifications : notifications?.slice(0, 3);

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          {unreadCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 bg-error text-error-foreground text-xs font-medium rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          iconName={showAll ? "ChevronUp" : "ChevronDown"}
          iconSize={16}
        >
          {showAll ? 'Show Less' : 'View All'}
        </Button>
      </div>
      <div className="space-y-3">
        {displayNotifications?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          displayNotifications?.map((notification) => (
            <div
              key={notification?.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-smooth ${
                notification?.read 
                  ? 'border-border bg-muted/20' :'border-primary/20 bg-primary/5 hover:bg-primary/10'
              }`}
              onClick={() => !notification?.read && markAsRead(notification?.id)}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getNotificationColor(notification?.type, notification?.priority)}`}>
                <Icon name={getNotificationIcon(notification?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className={`font-medium text-sm ${notification?.read ? 'text-muted-foreground' : 'text-foreground'}`}>
                    {notification?.title}
                  </h4>
                  <span className="text-xs text-muted-foreground font-mono ml-2 flex-shrink-0">
                    {formatTime(notification?.timestamp)}
                  </span>
                </div>
                <p className={`text-sm mt-1 ${notification?.read ? 'text-muted-foreground' : 'text-foreground/80'}`}>
                  {notification?.message}
                </p>
                {!notification?.read && (
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {notifications?.length > 3 && !showAll && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className="text-primary"
          >
            View {notifications?.length - 3} more notifications
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;