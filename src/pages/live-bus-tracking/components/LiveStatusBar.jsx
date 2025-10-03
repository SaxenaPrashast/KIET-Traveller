import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import RealTimeStatusIndicator from '../../../components/ui/RealTimeStatusIndicator';

const LiveStatusBar = ({ 
  totalBuses, 
  activeBuses, 
  selectedRoutes,
  onRefresh,
  className = '' 
}) => {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
        onRefresh?.();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh]);

  const getStatusSummary = () => {
    const onTime = Math.floor(activeBuses * 0.7);
    const delayed = Math.floor(activeBuses * 0.2);
    const disrupted = activeBuses - onTime - delayed;

    return { onTime, delayed, disrupted };
  };

  const status = getStatusSummary();

  return (
    <div className={`bg-card border border-border rounded-lg shadow-card ${className}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Activity" size={16} className="text-primary" />
            <h3 className="font-medium text-foreground">Live Status</h3>
          </div>
          <RealTimeStatusIndicator />
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{totalBuses}</div>
            <div className="text-xs text-muted-foreground">Total Buses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{status?.onTime}</div>
            <div className="text-xs text-muted-foreground">On Time</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{status?.delayed}</div>
            <div className="text-xs text-muted-foreground">Delayed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error">{status?.disrupted}</div>
            <div className="text-xs text-muted-foreground">Disrupted</div>
          </div>
        </div>

        {/* Status Bars */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Service Status</span>
            <span>{Math.round((activeBuses / totalBuses) * 100)}% Active</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-success"
                style={{ width: `${(status?.onTime / totalBuses) * 100}%` }}
              ></div>
              <div 
                className="bg-warning"
                style={{ width: `${(status?.delayed / totalBuses) * 100}%` }}
              ></div>
              <div 
                className="bg-error"
                style={{ width: `${(status?.disrupted / totalBuses) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                autoRefresh 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon name={autoRefresh ? "Pause" : "Play"} size={12} />
              <span>{autoRefresh ? "Auto" : "Manual"}</span>
            </button>
            
            {selectedRoutes?.length > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-primary/10 rounded text-xs">
                <Icon name="Filter" size={12} className="text-primary" />
                <span className="text-primary">{selectedRoutes?.length} routes</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setLastUpdate(new Date());
              onRefresh?.();
            }}
            className="flex items-center space-x-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="RefreshCw" size={12} />
            <span className="font-mono">
              {lastUpdate?.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveStatusBar;