import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import RealTimeStatusIndicator from '../../components/ui/RealTimeStatusIndicator';
import EmergencyAlertBanner from '../../components/ui/EmergencyAlertBanner';
import RouteSelector from './components/RouteSelector';
import RouteMap from './components/RouteMap';
import RouteDetails from './components/RouteDetails';
import AlternativeRoutes from './components/AlternativeRoutes';
import ScheduleTimeline from './components/ScheduleTimeline';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const RoutePreview = () => {
  const [selectedRoute, setSelectedRoute] = useState('route-1');
  const [selectedStop, setSelectedStop] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    // Check if route is bookmarked
    const bookmarkedRoutes = JSON.parse(localStorage.getItem('bookmarkedRoutes') || '[]');
    setIsBookmarked(bookmarkedRoutes?.includes(selectedRoute));
  }, [selectedRoute]);

  const handleRouteChange = (routeId) => {
    setSelectedRoute(routeId);
    setSelectedStop(null);
  };

  const handleBookmarkToggle = () => {
    const bookmarkedRoutes = JSON.parse(localStorage.getItem('bookmarkedRoutes') || '[]');
    let updatedBookmarks;
    
    if (isBookmarked) {
      updatedBookmarks = bookmarkedRoutes?.filter(id => id !== selectedRoute);
    } else {
      updatedBookmarks = [...bookmarkedRoutes, selectedRoute];
    }
    
    localStorage.setItem('bookmarkedRoutes', JSON.stringify(updatedBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  const handleStopClick = (stop) => {
    setSelectedStop(stop);
    setActiveTab('details');
  };

  const handleStopSelect = (stop) => {
    setSelectedStop(stop);
    // Here you would typically navigate to reminder setup or show a modal
    console.log('Setting reminder for stop:', stop?.name);
  };

  const handleAlternativeRouteSelect = (routeId) => {
    setSelectedRoute(routeId);
    setSelectedStop(null);
  };

  const tabs = [
    { id: 'details', label: 'Route Details', icon: 'MapPin' },
    { id: 'alternatives', label: 'Alternatives', icon: 'Route' },
    { id: 'schedule', label: 'Schedule', icon: 'Clock' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        {/* Emergency Alerts */}
        <div className="px-4 lg:px-6 py-4">
          <EmergencyAlertBanner />
        </div>

        {/* Page Header */}
        <div className="px-4 lg:px-6 py-6 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Route Preview</h1>
              <p className="text-muted-foreground mt-1">
                Explore complete bus route information with detailed timings and stops
              </p>
            </div>
            <RealTimeStatusIndicator />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-3 overflow-x-auto">
            <Button
              variant="outline"
              size="sm"
              iconName="Navigation"
              iconPosition="left"
              iconSize={16}
            >
              Live Tracking
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Bell"
              iconPosition="left"
              iconSize={16}
            >
              Set Reminders
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Share"
              iconPosition="left"
              iconSize={16}
            >
              Share Route
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
              iconSize={16}
            >
              Offline Map
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Route Selection & Map */}
            <div className="lg:col-span-2 space-y-6">
              <RouteSelector
                selectedRoute={selectedRoute}
                onRouteChange={handleRouteChange}
                onBookmarkToggle={handleBookmarkToggle}
                isBookmarked={isBookmarked}
              />
              
              <RouteMap
                selectedRoute={selectedRoute}
                onStopClick={handleStopClick}
              />
            </div>

            {/* Right Column - Route Information */}
            <div className="space-y-6">
              {/* Tab Navigation */}
              <div className="bg-card border border-border rounded-lg shadow-card">
                <div className="flex border-b border-border">
                  {tabs?.map((tab) => (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                        activeTab === tab?.id
                          ? 'text-primary border-b-2 border-primary bg-primary/5' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                    >
                      <Icon name={tab?.icon} size={16} />
                      <span className="hidden sm:inline">{tab?.label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-4">
                  {activeTab === 'details' && (
                    <RouteDetails
                      selectedRoute={selectedRoute}
                      onStopSelect={handleStopSelect}
                      selectedStop={selectedStop}
                    />
                  )}
                  
                  {activeTab === 'alternatives' && (
                    <AlternativeRoutes
                      currentRoute={selectedRoute}
                      onRouteSelect={handleAlternativeRouteSelect}
                    />
                  )}
                  
                  {activeTab === 'schedule' && (
                    <ScheduleTimeline
                      selectedRoute={selectedRoute}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Sheet for Route Details */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-modal max-h-96 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-1 bg-muted-foreground/30 rounded-full"></div>
            </div>
            
            <div className="flex space-x-1 mb-4 overflow-x-auto">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon name={tab?.icon} size={14} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </div>

            <div className="max-h-64 overflow-y-auto">
              {activeTab === 'details' && (
                <RouteDetails
                  selectedRoute={selectedRoute}
                  onStopSelect={handleStopSelect}
                  selectedStop={selectedStop}
                />
              )}
              
              {activeTab === 'alternatives' && (
                <AlternativeRoutes
                  currentRoute={selectedRoute}
                  onRouteSelect={handleAlternativeRouteSelect}
                />
              )}
              
              {activeTab === 'schedule' && (
                <ScheduleTimeline
                  selectedRoute={selectedRoute}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoutePreview;