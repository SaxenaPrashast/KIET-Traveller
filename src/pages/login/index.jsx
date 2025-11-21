import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BrandingHeader from './components/BrandingHeader';
import LoginForm from './components/LoginForm';
// import TrustSignals from './components/TrustSignals';
// import DemoCredentials from './components/DemoCredentials';

const LoginPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (authToken && userRole) {
      // Redirect to appropriate dashboard based on role
      switch (userRole) {
        case 'student': case'staff': navigate('/student-dashboard');
          break;
        case 'driver': navigate('/driver-dashboard');
          break;
        case 'admin': navigate('/admin-management');
          break;
        default:
          navigate('/student-dashboard');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-card border border-border rounded-2xl shadow-modal p-8">
          {/* Branding Header */}
          <BrandingHeader />
          
          {/* Login Form */}
          <LoginForm />
          
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground">
            © {new Date()?.getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;