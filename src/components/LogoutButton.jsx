import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import Icon from './AppIcon';

const LogoutButton = ({ variant = "outline", size = "sm", className = "" }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      try {
        await logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error('Logout failed:', error);
        // Still navigate to login even if the backend call fails
        navigate('/login', { replace: true });
      }
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      iconName="LogOut"
      iconPosition="left"
    >
      Logout {user?.firstName ? `(${user.firstName})` : ''}
    </Button>
  );
};

export default LogoutButton;

