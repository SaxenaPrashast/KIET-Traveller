import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const UserManagementPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const users = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@kiet.edu",
      role: "student",
      status: "active",
      lastActive: "2025-09-12T16:30:00Z",
      busRoute: "Route 3",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      email: "m.chen@kiet.edu",
      role: "staff",
      status: "active",
      lastActive: "2025-09-12T15:45:00Z",
      busRoute: "Route 1",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
    },
    {
      id: 3,
      name: "Robert Wilson",
      email: "r.wilson@kiet.edu",
      role: "driver",
      status: "active",
      lastActive: "2025-09-12T17:15:00Z",
      busRoute: "Route 2",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@kiet.edu",
      role: "student",
      status: "pending",
      lastActive: "2025-09-12T14:20:00Z",
      busRoute: "Route 4",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150"
    }
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-error/10 text-error';
      case 'driver':
        return 'bg-warning/10 text-warning';
      case 'staff':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-success/10 text-success';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success/10 text-success';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'suspended':
        return 'bg-error/10 text-error';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         user?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesRole = selectedRole === 'all' || user?.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const formatLastActive = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date?.toLocaleDateString();
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">User Management</h3>
          <Button variant="default" iconName="UserPlus" iconPosition="left" size="sm">
            Add User
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'student', 'staff', 'driver', 'admin']?.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {filteredUsers?.map((user) => (
            <div key={user?.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card ${
                    user?.status === 'active' ? 'bg-success' : 'bg-muted-foreground'
                  }`} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{user?.name}</h4>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                      {user?.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user?.status)}`}>
                      {user?.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{user?.busRoute}</p>
                  <p className="text-xs text-muted-foreground">
                    Active {formatLastActive(user?.lastActive)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Icon name="MoreVertical" size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserManagementPanel;