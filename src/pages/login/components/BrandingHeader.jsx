import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandingHeader = () => {
  return (
    <div className="text-center mb-8">
      {/* Logo */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-2xl shadow-card">
          <Icon name="bus" size={32} color="white" />
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-3xl font-bold text-foreground mb-2">
        KIET Traveller
      </h1>
      
      {/* Tagline */}
      <p className="text-muted-foreground text-lg mb-2">
        Smart Campus Transit
      </p>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Real-time bus tracking and route management for KIET Group of Institutions
      </p>
    </div>
  );
};

export default BrandingHeader;