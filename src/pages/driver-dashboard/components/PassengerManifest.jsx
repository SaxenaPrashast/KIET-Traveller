import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PassengerManifest = () => {
  const [selectedStop, setSelectedStop] = useState('all');

  const mockPassengers = [
    {
      id: 'p1',
      name: 'Rahul Sharma',
      studentId: 'KIET2021001',
      type: 'student',
      stop: 'Library Block',
      action: 'pickup',
      phone: '+91 98765 43210',
      status: 'confirmed',
      boardingTime: null
    },
    {
      id: 'p2',
      name: 'Dr. Priya Singh',
      employeeId: 'KIET2019F001',
      type: 'faculty',
      stop: 'Hostel Complex',
      action: 'dropoff',
      phone: '+91 98765 43211',
      status: 'onboard',
      boardingTime: '09:15'
    },
    {
      id: 'p3',
      name: 'Amit Kumar',
      studentId: 'KIET2022003',
      type: 'student',
      stop: 'Sports Complex',
      action: 'pickup',
      phone: '+91 98765 43212',
      status: 'waiting',
      boardingTime: null
    },
    {
      id: 'p4',
      name: 'Sarah Johnson',
      studentId: 'KIET2021004',
      type: 'student',
      stop: 'Main Gate',
      action: 'dropoff',
      phone: '+91 98765 43213',
      status: 'onboard',
      boardingTime: '09:10'
    },
    {
      id: 'p5',
      name: 'Prof. Rajesh Gupta',
      employeeId: 'KIET2018F002',
      type: 'faculty',
      stop: 'Library Block',
      action: 'pickup',
      phone: '+91 98765 43214',
      status: 'confirmed',
      boardingTime: null
    }
  ];

  const stops = ['all', 'Main Gate', 'Library Block', 'Hostel Complex', 'Sports Complex'];

  const filteredPassengers = selectedStop === 'all' 
    ? mockPassengers 
    : mockPassengers?.filter(p => p?.stop === selectedStop);

  const getStatusColor = (status) => {
    switch (status) {
      case 'onboard':
        return 'text-success bg-success/10 border-success';
      case 'confirmed':
        return 'text-primary bg-primary/10 border-primary';
      case 'waiting':
        return 'text-warning bg-warning/10 border-warning';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getActionIcon = (action) => {
    return action === 'pickup' ? 'UserPlus' : 'UserMinus';
  };

  const getActionColor = (action) => {
    return action === 'pickup' ? 'text-success' : 'text-warning';
  };

  const handlePassengerAction = (passengerId, action) => {
    console.log(`${action} passenger:`, passengerId);
  };

  const getPassengerStats = () => {
    const onboard = mockPassengers?.filter(p => p?.status === 'onboard')?.length;
    const waiting = mockPassengers?.filter(p => p?.status === 'waiting')?.length;
    const confirmed = mockPassengers?.filter(p => p?.status === 'confirmed')?.length;
    
    return { onboard, waiting, confirmed, total: mockPassengers?.length };
  };

  const stats = getPassengerStats();

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Passenger Manifest</h2>
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={20} className="text-primary" />
            <span className="font-semibold text-foreground">{stats?.total}</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-success/10 rounded-lg border border-success/20">
            <div className="text-2xl font-bold text-success">{stats?.onboard}</div>
            <div className="text-xs text-success">Onboard</div>
          </div>
          <div className="text-center p-3 bg-warning/10 rounded-lg border border-warning/20">
            <div className="text-2xl font-bold text-warning">{stats?.waiting}</div>
            <div className="text-xs text-warning">Waiting</div>
          </div>
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">{stats?.confirmed}</div>
            <div className="text-xs text-primary">Confirmed</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg border border-border">
            <div className="text-2xl font-bold text-foreground">{stats?.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>

        {/* Stop Filter */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {stops?.map((stop) => (
              <Button
                key={stop}
                variant={selectedStop === stop ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStop(stop)}
              >
                {stop === 'all' ? 'All Stops' : stop}
              </Button>
            ))}
          </div>
        </div>

        {/* Passenger List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredPassengers?.map((passenger) => (
            <div
              key={passenger?.id}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                  <Icon 
                    name={passenger?.type === 'faculty' ? 'GraduationCap' : 'User'} 
                    size={20} 
                    className="text-primary" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">{passenger?.name}</h4>
                    <div className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(passenger?.status)}`}>
                      {passenger?.status}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="font-mono">
                      {passenger?.type === 'faculty' ? passenger?.employeeId : passenger?.studentId}
                    </span>
                    <span>{passenger?.stop}</span>
                    {passenger?.boardingTime && (
                      <span className="font-mono">Boarded: {passenger?.boardingTime}</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Icon 
                    name={getActionIcon(passenger?.action)} 
                    size={16} 
                    className={getActionColor(passenger?.action)} 
                  />
                  <span className={`text-sm font-medium ${getActionColor(passenger?.action)}`}>
                    {passenger?.action}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(`tel:${passenger?.phone}`)}
                  title="Call passenger"
                >
                  <Icon name="Phone" size={16} />
                </Button>
                
                {passenger?.status === 'waiting' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePassengerAction(passenger?.id, 'board')}
                  >
                    Board
                  </Button>
                )}
                
                {passenger?.status === 'onboard' && passenger?.action === 'dropoff' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePassengerAction(passenger?.id, 'dropoff')}
                  >
                    Drop Off
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPassengers?.length === 0 && (
          <div className="text-center py-8">
            <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No passengers found for selected stop</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerManifest;