import React, { useState, useEffect } from 'react';
import logDev from './utils/logDev';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Import providers
import { AuthProvider } from './contexts/AuthContext';
import DataProvider from './contexts/DataContext';
import CrmProvider from './contexts/CrmContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext';

// Import pages
import ClerkSignIn from './pages/ClerkSignIn';
import ClerkSignUp from './pages/ClerkSignUp';
import Dashboard from './pages/Dashboard';
import CRMDashboard from './pages/CRMDashboard';
import ClientCRM from './pages/ClientCRM';
import ClientManagement from './pages/ClientManagement';
import ClientDetails from './pages/ClientDetails';
import FinancialAnalysis from './pages/FinancialAnalysis';
import ClientFinancialReport from './pages/ClientFinancialReport';
import ProposalManagement from './pages/ProposalManagement';
import UserManagement from './pages/UserManagement';
import ClientPortal from './pages/ClientPortal';
import ClientFinancialAnalysis from './pages/ClientFinancialAnalysis';
import ProfileSettings from './pages/ProfileSettings';
import ProjectionsSettings from './pages/ProjectionsSettings';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (isLoaded || authError) return;
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setAuthError('Authentication failed to initialize. Please check your environment variables or domain configuration.');
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoaded, authError]);
  
  logDev('App rendering, authentication state:', { isLoaded, isSignedIn });

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600">{authError}</p>
        </div>
      </div>
    );
  }
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not signed in, only show auth pages
  if (!isSignedIn) {
    return (
      <Routes>
        <Route path="/sign-in" element={<ClerkSignIn />} />
        <Route path="/sign-up" element={<ClerkSignUp />} />
        <Route path="*" element={<Navigate to="/sign-in" replace />} />
      </Routes>
    );
  }

  // If signed in, wrap the app with our providers
  return (
    <AuthProvider>
      <CrmProvider>
        <DataProvider>
          <FinancialAnalysisProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route
                path="/crm"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <CRMDashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clients/:clientId/crm"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <ClientCRM />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clients"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <ClientManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/clients/:clientId"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <ClientDetails />
                  </PrivateRoute>
                }
              />
              <Route
                path="/financial-analysis"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <FinancialAnalysis />
                  </PrivateRoute>
                }
              />
              <Route
                path="/financial-analysis/:clientId"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <FinancialAnalysis />
                  </PrivateRoute>
                }
              />
              <Route path="/clients/:clientId/report" element={<ClientFinancialReport />} />
              <Route
                path="/proposals"
                element={
                  <PrivateRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
                    <ProposalManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <UserManagement />
                  </PrivateRoute>
                }
              />
              <Route
                path="/client-portal"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <ClientPortal />
                  </PrivateRoute>
                }
              />
              <Route
                path="/client-financial-analysis"
                element={
                  <PrivateRoute allowedRoles={['client']}>
                    <ClientFinancialAnalysis />
                  </PrivateRoute>
                }
              />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route
                path="/projections-settings"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <ProjectionsSettings />
                  </PrivateRoute>
                }
              />
              <Route path="/sign-in" element={<Navigate to="/dashboard" replace />} />
              <Route path="/sign-up" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </FinancialAnalysisProvider>
        </DataProvider>
      </CrmProvider>
    </AuthProvider>
  );
}

export default App;
