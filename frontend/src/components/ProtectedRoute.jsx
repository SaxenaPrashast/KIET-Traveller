import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE, DASHBOARD_PATHS } from '../config/constants';

const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, user, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Verify user role matches their token
    const verifyUserRole = async () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const serverRole = data.data.user.role;
            
            // If server role doesn't match stored role, logout user
            if (serverRole !== user?.role) {
              console.error('Role mismatch detected');
              await logout();
              navigate('/login', { replace: true });
            }
          }
        }
      } catch (error) {
        console.error('Role verification failed:', error);
      }
    };

    if (isAuthenticated && user) {
      verifyUserRole();
    }
  }, [isAuthenticated, user, logout, navigate]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = getDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = getDashboardPath(user.role);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Helper function to get the correct dashboard path based on user role
const getDashboardPath = (role) => {
  return DASHBOARD_PATHS[role] || DASHBOARD_PATHS.STUDENT; // Default to student dashboard
};

export default ProtectedRoute;

