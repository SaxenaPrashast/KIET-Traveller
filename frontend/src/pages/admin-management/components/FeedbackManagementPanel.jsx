import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeedbackManagementPanel = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const feedbackItems = [
    {
      id: 1,
      type: 'complaint',
      category: 'service',
      title: 'Bus Route 3 Delay Issues',
      description: `The bus on Route 3 has been consistently late for the past week. This is causing students to miss their first classes. The scheduled arrival time is 8:30 AM but the bus arrives around 8:45-8:50 AM daily.\n\nThis needs immediate attention as it's affecting academic performance.`,
      submittedBy: 'Sarah Johnson',email: 'sarah.johnson@kiet.edu',route: 'Route 3',timestamp: new Date('2025-09-12T09:15:00Z'),status: 'pending',priority: 'high',
      response: null
    },
    {
      id: 2,
      type: 'suggestion',category: 'feature',title: 'Add Real-time Seat Availability',
      description: `It would be great if the app could show how many seats are available on each bus in real-time. This would help students plan better and avoid overcrowded buses.\n\nMaybe integrate with sensors or manual driver updates?`,
      submittedBy: 'Michael Chen',email: 'm.chen@kiet.edu',route: 'Route 1',timestamp: new Date('2025-09-12T14:30:00Z'),status: 'under_review',priority: 'medium',
      response: null
    },
    {
      id: 3,
      type: 'lost_item',category: 'lost_found',title: 'Lost Blue Backpack on Route 2',
      description: `I left my blue Adidas backpack on Route 2 bus (KIET-002) yesterday around 5:30 PM. It contains my laptop, textbooks, and ID card.\n\nPlease contact me if found. Very urgent as I have exams next week.`,
      submittedBy: 'Emily Davis',email: 'emily.davis@kiet.edu',route: 'Route 2',timestamp: new Date('2025-09-11T18:45:00Z'),status: 'resolved',priority: 'high',response: 'Item found and returned to student services. Please collect from main office.'
    },
    {
      id: 4,
      type: 'compliment',category: 'service',title: 'Excellent Service by Driver Wilson',description: `I want to appreciate Mr. Robert Wilson, driver of Route 1. He is always punctual, drives safely, and is very courteous to all students.\n\nHis professional attitude makes the daily commute pleasant. Thank you!`,submittedBy: 'David Kumar',email: 'd.kumar@kiet.edu',route: 'Route 1',timestamp: new Date('2025-09-10T16:20:00Z'),status: 'acknowledged',priority: 'low',response: 'Thank you for the positive feedback. We have shared this with Mr. Wilson and the management team.'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'complaint':
        return 'bg-error/10 text-error';
      case 'suggestion':
        return 'bg-primary/10 text-primary';
      case 'lost_item':
        return 'bg-warning/10 text-warning';
      case 'compliment':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'under_review':
        return 'bg-primary/10 text-primary';
      case 'resolved':
        return 'bg-success/10 text-success';
      case 'acknowledged':
        return 'bg-success/10 text-success';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error';
      case 'medium':
        return 'text-warning';
      case 'low':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'complaint':
        return 'AlertTriangle';
      case 'suggestion':
        return 'Lightbulb';
      case 'lost_item':
        return 'Package';
      case 'compliment':
        return 'Heart';
      default:
        return 'MessageSquare';
    }
  };

  const filteredFeedback = feedbackItems?.filter(item => {
    return selectedCategory === 'all' || item?.category === selectedCategory;
  });

  const formatTimestamp = (timestamp) => {
    return timestamp?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-card">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Feedback Management</h3>
          <Button variant="default" iconName="Download" iconPosition="left" size="sm">
            Export Report
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'service', 'feature', 'lost_found', 'technical']?.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category?.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {filteredFeedback?.map((item) => (
            <div 
              key={item?.id} 
              className={`border rounded-lg transition-smooth ${
                selectedFeedback === item?.id 
                  ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/50'
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setSelectedFeedback(selectedFeedback === item?.id ? null : item?.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <Icon 
                      name={getTypeIcon(item?.type)} 
                      size={20} 
                      className={`mt-1 ${
                        item?.type === 'complaint' ? 'text-error' :
                        item?.type === 'suggestion' ? 'text-primary' :
                        item?.type === 'lost_item' ? 'text-warning' : 'text-success'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-foreground">{item?.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item?.type)}`}>
                          {item?.type?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item?.status)}`}>
                          {item?.status?.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        By {item?.submittedBy} • {item?.route} • {formatTimestamp(item?.timestamp)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Icon name="Flag" size={12} className={getPriorityColor(item?.priority)} />
                        <span className={`text-xs font-medium ${getPriorityColor(item?.priority)}`}>
                          {item?.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <Icon 
                    name={selectedFeedback === item?.id ? "ChevronUp" : "ChevronDown"} 
                    size={20} 
                    className="text-muted-foreground"
                  />
                </div>
              </div>

              {selectedFeedback === item?.id && (
                <div className="px-4 pb-4 border-t border-border">
                  <div className="mt-4">
                    <h5 className="font-medium text-foreground mb-2">Description:</h5>
                    <div className="bg-muted/30 p-3 rounded-lg mb-4">
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {item?.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <span>Email: {item?.email}</span>
                      <span>Route: {item?.route}</span>
                    </div>

                    {item?.response && (
                      <div className="mb-4">
                        <h5 className="font-medium text-foreground mb-2">Admin Response:</h5>
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <p className="text-sm text-foreground">{item?.response}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end space-x-2">
                      {!item?.response && (
                        <Button variant="default" size="sm" iconName="MessageSquare" iconPosition="left">
                          Respond
                        </Button>
                      )}
                      <Button variant="outline" size="sm" iconName="Mail" iconPosition="left">
                        Contact User
                      </Button>
                      <Button variant="outline" size="sm" iconName="Archive" iconPosition="left">
                        Archive
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagementPanel;