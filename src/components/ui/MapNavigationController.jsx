import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const MapNavigationController = ({ 
  onZoomIn, 
  onZoomOut, 
  onCenter, 
  onToggleLayer,
  showLayerToggle = true,
  className = '' 
}) => {
  const [activeLayer, setActiveLayer] = useState('traffic');

  const handleLayerToggle = () => {
    const layers = ['traffic', 'satellite', 'terrain'];
    const currentIndex = layers?.indexOf(activeLayer);
    const nextLayer = layers?.[(currentIndex + 1) % layers?.length];
    setActiveLayer(nextLayer);
    onToggleLayer?.(nextLayer);
  };

  const getLayerIcon = () => {
    switch (activeLayer) {
      case 'traffic':
        return 'Navigation';
      case 'satellite':
        return 'Satellite';
      case 'terrain':
        return 'Mountain';
      default:
        return 'Map';
    }
  };

  const getLayerLabel = () => {
    switch (activeLayer) {
      case 'traffic':
        return 'Traffic';
      case 'satellite':
        return 'Satellite';
      case 'terrain':
        return 'Terrain';
      default:
        return 'Map';
    }
  };

  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      {/* Zoom Controls */}
      <div className="flex flex-col bg-card border border-border rounded-lg shadow-card overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomIn}
          className="rounded-none border-b border-border hover:bg-muted"
        >
          <Icon name="Plus" size={18} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onZoomOut}
          className="rounded-none hover:bg-muted"
        >
          <Icon name="Minus" size={18} />
        </Button>
      </div>

      {/* Center Control */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onCenter}
        className="bg-card border border-border shadow-card hover:bg-muted"
        title="Center on current location"
      >
        <Icon name="Crosshair" size={18} />
      </Button>

      {/* Layer Toggle */}
      {showLayerToggle && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLayerToggle}
          className="bg-card border border-border shadow-card hover:bg-muted"
          title={`Switch to ${getLayerLabel()} view`}
        >
          <Icon name={getLayerIcon()} size={18} />
        </Button>
      )}

      {/* Compass/Direction Indicator */}
      <div className="bg-card border border-border rounded-lg shadow-card p-2">
        <div className="flex items-center justify-center">
          <Icon name="Compass" size={16} className="text-muted-foreground" />
        </div>
        <div className="text-xs text-center text-muted-foreground font-mono mt-1">
          N
        </div>
      </div>
    </div>
  );
};

export default MapNavigationController;