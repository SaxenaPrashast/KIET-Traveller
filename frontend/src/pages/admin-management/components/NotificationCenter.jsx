import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuth } from '../../../contexts/AuthContext';
import { API_BASE } from '../../../config/constants';

const NotificationCenter = () => {

  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [notificationText, setNotificationText] = useState('');
  const [selectedUserTypes, setSelectedUserTypes] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);

  const { token } = useAuth();

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

  const userTypes = [
    { id: 'students', name: 'Students' },
    { id: 'staff', name: 'Staff' },
    { id: 'drivers', name: 'Drivers' },
    { id: 'all', name: 'All Users' }
  ];

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template?.id);
    setNotificationText(template?.content);
  };

  const handleUserTypeToggle = (userType) => {
    setSelectedUserTypes(prev =>
      prev?.includes(userType)
        ? prev?.filter(type => type !== userType)
        : [...prev, userType]
    );
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (data.success) {
        setRecentNotifications(data.data.notifications);
      }

    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleSendNotification = async () => {

    if (!notificationText?.trim() || selectedUserTypes?.length === 0) {
      return;
    }

    let roles = [];

    selectedUserTypes.forEach(type => {

      if (type === "students") roles.push("student");
      if (type === "staff") roles.push("staff");
      if (type === "drivers") roles.push("driver");

      if (type === "all") {
        roles = ["student", "staff", "driver"];
      }

    });

    try {

      const res = await fetch(`${API_BASE}/notifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: "Admin Notification",
          message: notificationText,
          targetRoles: roles
        })
      });

      const data = await res.json();

      if (data.success) {
        fetchNotifications();
      }

    } catch (err) {
      console.error("Notification send error:", err);
    }

    setNotificationText('');
    setSelectedUserTypes([]);
    setSelectedTemplate('');
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);

    return date?.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">

      <div className="bg-card border border-border rounded-lg shadow-card">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Send Notification</h3>
        </div>

        <div className="p-6 space-y-6">

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Quick Templates
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {templates?.map((template) => (

                <button
                  key={template?.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-3 text-left border rounded-lg ${
                    selectedTemplate === template?.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                >

                  <h4 className="font-medium text-foreground">
                    {template?.title}
                  </h4>

                  <p className="text-sm text-muted-foreground mt-1">
                    {template?.content}
                  </p>

                </button>

              ))}
            </div>
          </div>

          <Input
            label="Notification Message"
            type="text"
            placeholder="Enter your notification message..."
            value={notificationText}
            onChange={(e) => setNotificationText(e.target.value)}
          />

          <div>

            <label className="block text-sm font-medium text-foreground mb-3">
              Target Users *
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

              {userTypes?.map((userType) => (

                <label
                  key={userType.id}
                  className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                >

                  <input
                    type="checkbox"
                    checked={selectedUserTypes.includes(userType.id)}
                    onChange={() => handleUserTypeToggle(userType.id)}
                  />

                  <span className="text-sm text-foreground">
                    {userType.name}
                  </span>

                </label>

              ))}

            </div>

          </div>

          <div className="flex justify-end space-x-3">

            <Button
              variant="outline"
              onClick={() => {
                setNotificationText('');
                setSelectedUserTypes([]);
                setSelectedTemplate('');
              }}
            >
              Clear
            </Button>

            <Button
              onClick={handleSendNotification}
              iconName="Send"
              iconPosition="left"
            >
              Send Notification
            </Button>

          </div>

        </div>

      </div>

      <div className="bg-card border border-border rounded-lg shadow-card">

        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Recent Notifications
          </h3>
        </div>

        <div className="p-6 space-y-4">

          {recentNotifications?.map((notification) => (

            <div
              key={notification._id}
              className="flex items-start space-x-4 p-4 border border-border rounded-lg"
            >

              <div className="p-2 bg-primary/10 rounded-lg">
                <Icon name="Bell" size={20} className="text-primary" />
              </div>

              <div className="flex-1">

                <h4 className="font-medium text-foreground">
                  {notification.title}
                </h4>

                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>

                <div className="text-xs text-muted-foreground mt-2">
                  Recipients: {notification.recipients?.length} • {formatTimestamp(notification.createdAt)}
                </div>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
};

export default NotificationCenter;