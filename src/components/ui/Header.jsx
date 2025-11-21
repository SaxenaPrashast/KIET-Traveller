import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import LogoutButton from '../LogoutButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Bus Arrived',
      message: 'Route 3 bus arrived at Library Block',
      time: '5 mins ago',
      read: false,
      type: 'arrival'
    },
    {
      id: 2,
      title: 'Schedule Update',
      message: 'Route 5 schedule delayed by 10 minutes',
      time: '15 mins ago',
      read: false,
      type: 'delay'
    },
    {
      id: 3,
      title: 'Reminder',
      message: 'Your bus departs in 30 minutes from Main Gate',
      time: '30 mins ago',
      read: true,
      type: 'reminder'
    }
  ]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const unreadCount = notifications?.filter(n => !n?.read)?.length;

  const navigationItems = [
    { path: '/student-dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/live-bus-tracking', label: 'Live Tracking', icon: 'MapPin' },
    { path: '/route-preview', label: 'Routes', icon: 'Route' },
    { path: user?.role === 'driver' ? '/driver-dashboard' : null, label: 'Driver Portal', icon: 'Truck' },
  ].filter(item => item.path !== null);

  const secondaryItems = [
    { path: '/admin-management', label: 'Admin', icon: 'Settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const isActive = (path) => location?.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="Bus" size={24} color="white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">KIET Traveller</h1>
            <span className="text-xs text-muted-foreground hidden sm:block">Smart Campus Transit</span>
          </div>
        </div>

        {/* User info and greeting */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name={user?.role === 'admin' ? 'ShieldCheck' : 'User'} size={16} className="text-primary" />
          <span>Welcome, {user?.firstName || 'User'}</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActive(item?.path) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={16}
              className="px-3"
            >
              {item?.label}
            </Button>
          ))}

          {/* Secondary Navigation */}
          {user?.role === 'admin' && secondaryItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActive(item?.path) ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={16}
              className="px-3"
            >
              {item?.label}
            </Button>
          ))}

          {/* Notification Bell */}
          <div className="relative ml-2 border-l border-border pl-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border p-4">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                </div>
                
                {notifications?.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications?.map((notification) => (
                      <div
                        key={notification?.id}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification?.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            notification?.read ? 'bg-muted-foreground' : 'bg-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{notification?.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification?.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notification?.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <div className="ml-2 border-l border-border pl-2">
            <LogoutButton 
              variant="destructive" 
              size="sm"
            />
          </div>
        </nav>

        {/* Mobile Menu Button and Notification */}
        <div className="lg:hidden flex items-center space-x-2">
          {/* Mobile Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="relative"
            >
              <Icon name="Bell" size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-error text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {/* Mobile Notification Dropdown */}
            {notificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="sticky top-0 bg-card border-b border-border p-4">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                </div>
                
                {notifications?.length > 0 ? (
                  <div className="divide-y divide-border">
                    {notifications?.map((notification) => (
                      <div
                        key={notification?.id}
                        className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                          !notification?.read ? 'bg-primary/5' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                            notification?.read ? 'bg-muted-foreground' : 'bg-primary'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm">{notification?.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{notification?.message}</p>
                            <p className="text-xs text-muted-foreground mt-2">{notification?.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Icon name="Bell" size={32} className="text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Icon name={isMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <nav className="px-4 py-4 space-y-2">
            {/* User info in mobile menu */}
            <div className="flex items-center space-x-2 px-3 py-2 mb-2 text-sm text-muted-foreground border-b border-border">
              <Icon name={user?.role === 'admin' ? 'ShieldCheck' : 'User'} size={16} className="text-primary" />
              <span>Welcome, {user?.firstName || 'User'}</span>
            </div>

            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`flex items-center w-full px-3 py-3 rounded-lg text-left transition-smooth ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={20} className="mr-3" />
                <span className="font-medium">{item?.label}</span>
              </button>
            ))}
            
            {user?.role === 'admin' && (
              <>
                <hr className="my-3 border-border" />
                {secondaryItems?.map((item) => (
                  <button
                    key={item?.path}
                    onClick={() => handleNavigation(item?.path)}
                    className="flex items-center w-full px-3 py-3 rounded-lg text-left text-foreground hover:bg-muted transition-smooth"
                  >
                    <Icon name={item?.icon} size={20} className="mr-3" />
                    <span className="font-medium">{item?.label}</span>
                  </button>
                ))}
              </>
            )}
            
            <div className="mt-3 pt-3 border-t border-border">
              <LogoutButton 
                variant="destructive"
                size="sm"
                className="w-full justify-center py-3"
              />
            </div>
          </nav>
        </div>
      )}
      {/* Backdrop for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;