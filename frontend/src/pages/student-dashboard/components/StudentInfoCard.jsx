import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/AppIcon';

const StudentInfoCard = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-card">

      <div className="flex items-center space-x-4">

        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icon name="User" size={20} className="text-primary" />
        </div>

        <div>
          <h3 className="font-semibold text-lg">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-muted-foreground">
            {user.email}
          </p>
        </div>

      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">

        <div>
          <p className="text-muted-foreground">Role</p>
          <p className="font-medium capitalize">{user.role}</p>
        </div>

        {user.department && (
          <div>
            <p className="text-muted-foreground">Department</p>
            <p className="font-medium">{user.department}</p>
          </div>
        )}

        {user.year && (
          <div>
            <p className="text-muted-foreground">Year</p>
            <p className="font-medium">{user.year}</p>
          </div>
        )}

      </div>

    </div>
  );
};

export default StudentInfoCard;