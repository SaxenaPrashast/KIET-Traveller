import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import PublicRoute from "components/PublicRoute";
import NotFound from "pages/NotFound";
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import AdminManagement from './pages/admin-management';
import StudentDashboard from './pages/student-dashboard';
import RoutePreview from './pages/route-preview';
import DriverDashboard from './pages/driver-dashboard';

const Routes = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ErrorBoundary>
          <ScrollToTop />
          <RouterRoutes>
            {/* Public Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin-management" element={
              <ProtectedRoute requiredRole="admin">
                <AdminManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/student-dashboard" element={
              <ProtectedRoute allowedRoles={['student', 'staff']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/driver-dashboard" element={
              <ProtectedRoute requiredRole="driver">
                <DriverDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/live-bus-tracking" element={
              <ProtectedRoute>
                <LiveBusTracking />
              </ProtectedRoute>
            } />
            
            <Route path="/route-preview" element={
              <ProtectedRoute>
                <RoutePreview />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </RouterRoutes>
        </ErrorBoundary>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default Routes;
