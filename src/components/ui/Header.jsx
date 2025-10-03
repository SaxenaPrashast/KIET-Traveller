import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import LogoutButton from '../LogoutButton';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

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

          {/* Logout Button */}
          <div className="ml-2 border-l border-border pl-2">
            <LogoutButton 
              variant="destructive" 
              size="sm"
            />
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden"
        >
          <Icon name={isMenuOpen ? "X" : "Menu"} size={24} />
        </Button>
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