import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemMetricsCard = ({ title, value, change, icon, color = 'primary' }) => {
  const getColorClasses = () => {
    switch (color) {
      case 'success':
        return {
          bg: 'bg-success/10',
          text: 'text-success',
          icon: 'text-success'
        };
      case 'warning':
        return {
          bg: 'bg-warning/10',
          text: 'text-warning',
          icon: 'text-warning'
        };
      case 'error':
        return {
          bg: 'bg-error/10',
          text: 'text-error',
          icon: 'text-error'
        };
      default:
        return {
          bg: 'bg-primary/10',
          text: 'text-primary',
          icon: 'text-primary'
        };
    }
  };

  const colors = getColorClasses();
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              <Icon 
                name={isPositive ? "TrendingUp" : isNegative ? "TrendingDown" : "Minus"} 
                size={16} 
                className={`mr-1 ${isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'}`}
              />
              <span className={`text-sm font-medium ${isPositive ? 'text-success' : isNegative ? 'text-error' : 'text-muted-foreground'}`}>
                {Math.abs(change)}% from last week
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colors?.bg}`}>
          <Icon name={icon} size={24} className={colors?.icon} />
        </div>
      </div>
    </div>
  );
};

export default SystemMetricsCard;