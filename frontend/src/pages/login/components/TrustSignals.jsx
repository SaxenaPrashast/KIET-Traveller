import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      text: 'Secure Authentication'
    },
    {
      icon: 'Lock',
      text: 'Data Protection'
    },
    {
      icon: 'CheckCircle',
      text: 'Verified Institution'
    }
  ];

  return (
    <div className="mt-8 pt-6 border-t border-border">
      <div className="flex items-center justify-center space-x-6">
        {trustFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Icon 
              name={feature?.icon} 
              size={16} 
              className="text-success" 
            />
            <span className="text-xs text-muted-foreground font-medium">
              {feature?.text}
            </span>
          </div>
        ))}
      </div>
      {/* SSL Certificate Badge */}
      <div className="flex items-center justify-center mt-4">
        <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 rounded-full">
          <Icon name="Shield" size={14} className="text-success" />
          <span className="text-xs text-success font-medium">SSL Secured</span>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;