import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PassengerManifest = ({
  bus,
  currentSchedule,
  actionLoading,
  onStartTrip,
  onCompleteTrip,
  onCancelTrip,
  onRefreshLocation
}) => {
  const canStart = currentSchedule?.status === 'scheduled';
  const canComplete = ['in_progress', 'delayed'].includes(currentSchedule?.status);
  const canCancel = ['scheduled', 'in_progress', 'delayed'].includes(currentSchedule?.status);

  const handleCancel = () => {
    const reason = window.prompt('Enter a cancellation reason', 'Trip cancelled by driver');
    if (reason) {
      onCancelTrip(reason);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Driver Controls</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Bus" size={20} className="text-primary" />
            <span className="font-semibold text-foreground">{bus?.busNumber || 'Not Assigned'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Button onClick={onRefreshLocation} loading={actionLoading === 'location'} iconName="LocateFixed" variant="outline">
            Refresh GPS
          </Button>
          <Button onClick={onStartTrip} loading={actionLoading === 'start'} disabled={!canStart} iconName="Play" variant="default">
            Start Trip
          </Button>
          <Button onClick={onCompleteTrip} loading={actionLoading === 'complete'} disabled={!canComplete} iconName="CheckCircle" variant="success">
            Complete Trip
          </Button>
          <Button onClick={handleCancel} loading={actionLoading === 'cancel'} disabled={!canCancel} iconName="XCircle" variant="danger">
            Cancel Trip
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PassengerManifest;
