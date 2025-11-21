import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsSection = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'route-preview',
      title: 'Browse Routes',
      description: 'View all available routes',
      icon: 'Route',
      color: 'bg-primary/10 text-primary',
      action: () => navigate('/route-preview')
    },
    {
      id: 'live-tracking',
      title: 'Live Tracking',
      description: 'Track buses in real-time',
      icon: 'MapPin',
      color: 'bg-success/10 text-success',
      action: () => navigate('/live-bus-tracking')
    },
    {
      id: 'stop-reminders',
      title: 'Stop Reminders',
      description: 'Set arrival notifications',
      icon: 'Bell',
      color: 'bg-warning/10 text-warning',
      action: () => alert('Stop reminders feature coming soon!')
    },
    {
      id: 'peer-sharing',
      title: 'Share Location',
      description: 'Coordinate with friends',
      icon: 'Users',
      color: 'bg-secondary/10 text-secondary',
      action: () => alert('Peer location sharing feature coming soon!')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <Icon name="Zap" size={20} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quickActions?.map((action) => (
          <button
            key={action?.id}
            onClick={action?.action}
            className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-smooth text-left group"
          >
            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${action?.color} group-hover:scale-105 transition-transform`}>
              <Icon name={action?.icon} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                {action?.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {action?.description}
              </p>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-primary transition-colors mt-1" />
          </button>
        ))}
      </div>
      {/* Emergency Contact */}
      <div className="mt-6 p-4 bg-error/5 border border-error/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-error/10 rounded-full">
            <Icon name="Phone" size={16} className="text-error" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-error">Emergency Contact</h4>
            <p className="text-sm text-error/80">Transport Office: +91-9876543210</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('tel:+919876543210')}
            iconName="Phone"
            iconSize={14}
            className="border-error text-error hover:bg-error hover:text-error-foreground"
          >
            Call
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsSection;