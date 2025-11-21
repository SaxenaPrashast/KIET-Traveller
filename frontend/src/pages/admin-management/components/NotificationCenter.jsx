import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NotificationCenter = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [selectedUserTypes, setSelectedUserTypes] = useState([]);

  const templates = [
    {
      id: 'delay',
      title: 'Service Delay',
      content: 'Route {route} is experiencing a {duration} minute delay due to {reason}. Expected arrival time is now {new_time}.'
    },
    {
      id: 'maintenance',
      title: 'Maintenance Notice',
      content: 'Scheduled maintenance for {service} will occur on {date} from {start_time} to {end_time}. Service may be temporarily unavailable.'
    },
    {
      id: 'emergency',
      title: 'Emergency Alert',
      content: 'URGENT: {emergency_type} affecting {affected_area}. Please follow safety protocols and check for updates.'
    },
    {
      id: 'general',
      title: 'General Announcement',
      content: 'Important update: {message}'
    }
  ];

  const routes = [
    { id: 'route1', name: 'Route 1 - Main Campus' },
    { id: 'route2', name: 'Route 2 - Hostel Circuit' },
    { id: 'route3', name: 'Route 3 - City Center' },
    { id: 'route4', name: 'Route 4 - Residential Area' }
  ];

  const userTypes = [
    { id: 'students', name: 'Students' },
    { id: 'staff', name: 'Staff' },
    { id: 'drivers', name: 'Drivers' },
    { id: 'all', name: 'All Users' }
  ];

  const recentNotifications = [
    {
      id: 1,
      title: 'Route 3 Delay Alert',
      content: 'Route 3 is experiencing a 15 minute delay due to traffic congestion.',
      sentTo: 'Route 3 Users',
      timestamp: new Date('2025-09-12T16:30:00Z'),
      status: 'sent',
      recipients: 58
    },
    {
      id: 2,
      title: 'System Maintenance Notice',
      content: 'Scheduled maintenance tonight from 2:00 AM to 4:00 AM.',
      sentTo: 'All Users',
      timestamp: new Date('2025-09-12T14:15:00Z'),
      status: 'sent',
      recipients: 1247
    },
    {
      id: 3,
      title: 'New Feature Announcement',
      content: 'Real-time seat availability feature now available in the app.',
      sentTo: 'Students',
      timestamp: new Date('2025-09-12T10:00:00Z'),
      status: 'sent',
      recipients: 892
    }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template?.id);
    setNotificationText(template?.content);
  };

  const handleRouteToggle = (routeId) => {
    setSelectedRoutes(prev => 
      prev?.includes(routeId) 
        ? prev?.filter(id => id !== routeId)
        : [...prev, routeId]
    );
  };

  const handleUserTypeToggle = (userType) => {
    setSelectedUserTypes(prev => 
      prev?.includes(userType) 
        ? prev?.filter(type => type !== userType)
        : [...prev, userType]
    );
  };

  const handleSendNotification = () => {
    if (!notificationText?.trim() || selectedUserTypes?.length === 0) {
      return;
    }
    
    // Simulate sending notification
    console.log('Sending notification:', {
      content: notificationText,
      routes: selectedRoutes,
      userTypes: selectedUserTypes
    });
    
    // Reset form
    setNotificationText('');
    setSelectedRoutes([]);
    setSelectedUserTypes([]);
    setSelectedTemplate('');
  };

  const formatTimestamp = (timestamp) => {
    return timestamp?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Send New Notification */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Send Notification</h3>
        </div>
        <div className="p-6 space-y-6">
          {/* Templates */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Quick Templates
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates?.map((template) => (
                <button
                  key={template?.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 text-left border rounded-lg transition-smooth ${
                    selectedTemplate === template?.id
                      ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/50'
                  }`}
                >
                  <h4 className="font-medium text-foreground">{template?.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {template?.content}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Message Content */}
          <div>
            <Input
              label="Notification Message"
              type="text"
              placeholder="Enter your notification message..."
              value={notificationText}
              onChange={(e) => setNotificationText(e?.target?.value)}
              required
            />
          </div>

          {/* Target Routes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Target Routes (Optional)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {routes?.map((route) => (
                <label
                  key={route?.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoutes?.includes(route?.id)}
                    onChange={() => handleRouteToggle(route?.id)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{route?.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Target User Types */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Target Users *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {userTypes?.map((userType) => (
                <label
                  key={userType?.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-smooth"
                >
                  <input
                    type="checkbox"
                    checked={selectedUserTypes?.includes(userType?.id)}
                    onChange={() => handleUserTypeToggle(userType?.id)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm text-foreground">{userType?.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Send Button */}
          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setNotificationText('');
                setSelectedRoutes([]);
                setSelectedUserTypes([]);
                setSelectedTemplate('');
              }}
            >
              Clear
            </Button>
            <Button
              variant="default"
              onClick={handleSendNotification}
              disabled={!notificationText?.trim() || selectedUserTypes?.length === 0}
              iconName="Send"
              iconPosition="left"
            >
              Send Notification
            </Button>
          </div>
        </div>
      </div>
      {/* Recent Notifications */}
      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Recent Notifications</h3>
            <Button variant="outline" size="sm" iconName="History" iconPosition="left">
              View All
            </Button>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentNotifications?.map((notification) => (
              <div key={notification?.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg">
                <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg">
                  <Icon name="Bell" size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">{notification?.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification?.content}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span>Sent to: {notification?.sentTo}</span>
                    <span>Recipients: {notification?.recipients}</span>
                    <span>{formatTimestamp(notification?.timestamp)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                    {notification?.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;