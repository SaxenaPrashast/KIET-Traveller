import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DemoCredentials = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const credentials = [
    {
      role: 'Student',
      email: 'student@kiet.edu',
      password: 'student123',
      description: 'Access student dashboard and bus tracking'
    },
    {
      role: 'Staff',
      email: 'staff@kiet.edu',
      password: 'staff123',
      description: 'Faculty and staff transportation access'
    },
    {
      role: 'Driver',
      email: 'driver@kiet.edu',
      password: 'driver123',
      description: 'Driver dashboard for GPS sharing'
    },
    {
      role: 'Admin',
      email: 'admin@kiet.edu',
      password: 'admin123',
      description: 'Full system administration access'
    }
  ];

  return (
    <div className="mt-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        iconName={isExpanded ? 'ChevronUp' : 'ChevronDown'}
        iconPosition="right"
        className="w-full"
      >
        Demo Credentials
      </Button>
      {isExpanded && (
        <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center">
            <Icon name="Key" size={16} className="mr-2" />
            Test Login Credentials
          </h4>
          
          <div className="space-y-3">
            {credentials?.map((cred, index) => (
              <div key={index} className="p-3 bg-card rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">
                    {cred?.role}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Icon name="User" size={12} className="text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-1 text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{cred?.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Lock" size={12} className="text-muted-foreground" />
                    <span className="text-muted-foreground">{cred?.password}</span>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  {cred?.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-3 p-2 bg-warning/10 rounded border border-warning/20">
            <p className="text-xs text-warning flex items-center">
              <Icon name="AlertTriangle" size={12} className="mr-1" />
              For demonstration purposes only
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoCredentials;