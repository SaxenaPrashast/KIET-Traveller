import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsSection = () => {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-4 w-full">
      <h2 className="text-base font-semibold text-foreground mb-3 flex items-center">
        <Icon name="Phone" size={16} className="text-error mr-2" />
        Emergency Contact
      </h2>

      <div className="p-3 bg-error/5 border border-error/20 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="Phone" size={20} className="text-error" />

          <div>
            <h4 className="font-medium text-error leading-none">
              Transport Office
            </h4>
            <p className="text-sm text-error/80 leading-none mt-1">
              +91-9876543210
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open('tel:+919876543210')}
          className="border-error text-error hover:bg-error hover:text-error-foreground"
        >
          Call
        </Button>
      </div>
    </div>
  );
};

export default QuickActionsSection;
