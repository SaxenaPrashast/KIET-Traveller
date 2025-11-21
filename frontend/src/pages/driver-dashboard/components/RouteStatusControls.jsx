import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const RouteStatusControls = ({ onStatusUpdate }) => {
  const [delayMinutes, setDelayMinutes] = useState('');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [showDelayForm, setShowDelayForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);

  const quickStatusUpdates = [
    {
      id: 'on-time',
      title: 'On Schedule',
      description: 'Route running on time',
      icon: 'CheckCircle',
      color: 'text-success',
      variant: 'outline'
    },
    {
      id: 'minor-delay',
      title: '5 Min Delay',
      description: 'Minor traffic delay',
      icon: 'Clock',
      color: 'text-warning',
      variant: 'outline'
    },
    {
      id: 'major-delay',
      title: 'Major Delay',
      description: 'Significant delay occurred',
      icon: 'AlertCircle',
      color: 'text-error',
      variant: 'outline'
    },
    {
      id: 'breakdown',
      title: 'Vehicle Issue',
      description: 'Mechanical problem',
      icon: 'Wrench',
      color: 'text-error',
      variant: 'destructive'
    }
  ];

  const handleQuickStatus = (statusId) => {
    let message = '';
    let delayTime = 0;

    switch (statusId) {
      case 'on-time':
        message = 'Route is running on schedule';
        break;
      case 'minor-delay':
        message = 'Minor traffic delay - 5 minutes behind schedule';
        delayTime = 5;
        break;
      case 'major-delay':
        setShowDelayForm(true);
        return;
      case 'breakdown':
        setShowIncidentForm(true);
        return;
      default:
        return;
    }

    onStatusUpdate?.({
      type: statusId,
      message,
      delay: delayTime,
      timestamp: new Date()
    });
  };

  const handleDelaySubmit = () => {
    if (!delayMinutes) return;

    onStatusUpdate?.({
      type: 'custom-delay',
      message: `Route delayed by ${delayMinutes} minutes`,
      delay: parseInt(delayMinutes),
      timestamp: new Date()
    });

    setDelayMinutes('');
    setShowDelayForm(false);
  };

  const handleIncidentSubmit = () => {
    if (!incidentDescription) return;

    onStatusUpdate?.({
      type: 'incident',
      message: incidentDescription,
      delay: 0,
      timestamp: new Date(),
      requiresAttention: true
    });

    setIncidentDescription('');
    setShowIncidentForm(false);
  };

  const handleEmergencyStop = () => {
    onStatusUpdate?.({
      type: 'emergency',
      message: 'EMERGENCY STOP - Immediate assistance required',
      delay: 0,
      timestamp: new Date(),
      priority: 'high',
      requiresAttention: true
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Route Status</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span className="text-sm text-muted-foreground">Active Route</span>
          </div>
        </div>

        {/* Quick Status Updates */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickStatusUpdates?.map((status) => (
            <Button
              key={status?.id}
              variant={status?.variant}
              onClick={() => handleQuickStatus(status?.id)}
              className="h-16 flex-col space-y-1 justify-center"
            >
              <Icon name={status?.icon} size={20} className={status?.color} />
              <div className="text-center">
                <div className="font-medium text-sm">{status?.title}</div>
                <div className="text-xs opacity-75">{status?.description}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Custom Delay Form */}
        {showDelayForm && (
          <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Report Custom Delay</h3>
            <div className="space-y-3">
              <Input
                type="number"
                label="Delay Duration (minutes)"
                placeholder="Enter delay in minutes"
                value={delayMinutes}
                onChange={(e) => setDelayMinutes(e?.target?.value)}
                min="1"
                max="120"
              />
              <div className="flex space-x-2">
                <Button
                  variant="default"
                  onClick={handleDelaySubmit}
                  disabled={!delayMinutes}
                  iconName="Send"
                  iconPosition="left"
                  iconSize={16}
                >
                  Report Delay
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDelayForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Incident Report Form */}
        {showIncidentForm && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg">
            <h3 className="font-medium text-foreground mb-3">Report Incident</h3>
            <div className="space-y-3">
              <Input
                type="text"
                label="Incident Description"
                placeholder="Describe the issue or incident"
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e?.target?.value)}
              />
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={handleIncidentSubmit}
                  disabled={!incidentDescription}
                  iconName="AlertTriangle"
                  iconPosition="left"
                  iconSize={16}
                >
                  Report Incident
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowIncidentForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Emergency Controls */}
        <div className="border-t border-border pt-6">
          <h3 className="font-medium text-foreground mb-4">Emergency Controls</h3>
          <div className="space-y-3">
            <Button
              variant="destructive"
              onClick={handleEmergencyStop}
              iconName="AlertTriangle"
              iconPosition="left"
              iconSize={16}
              fullWidth
              className="h-12"
            >
              EMERGENCY STOP
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                iconName="Phone"
                iconPosition="left"
                iconSize={16}
                onClick={() => window.open('tel:+911234567890')}
              >
                Call Control
              </Button>
              <Button
                variant="outline"
                iconName="MessageSquare"
                iconPosition="left"
                iconSize={16}
                onClick={() => console.log('Open emergency chat')}
              >
                Emergency Chat
              </Button>
            </div>
          </div>
        </div>

        {/* Current Status Display */}
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Current Status:</span>
            <div className="flex items-center space-x-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="font-medium text-success">On Schedule</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Last Update:</span>
            <span className="font-mono text-foreground">
              {new Date()?.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteStatusControls;