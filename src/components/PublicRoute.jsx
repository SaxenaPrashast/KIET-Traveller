import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, redirect to appropriate dashboard
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || '/';
    const redirectPath = getDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Helper function to get the correct dashboard path based on user role
const getDashboardPath = (role) => {
  switch (role) {
    case 'student':
      return '/student-dashboard';
    case 'staff':
      return '/student-dashboard'; // Staff can access student dashboard
    case 'driver':
      return '/driver-dashboard';
    case 'admin':
      return '/admin-management';
    default:
      return '/student-dashboard';
  }
};

export default PublicRoute;

