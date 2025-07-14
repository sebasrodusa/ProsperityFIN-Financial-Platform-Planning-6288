import React from 'react';
import logDev from './utils/logDev';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Import providers
import AuthProvider from './contexts/AuthContext';
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

function App() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  
  logDev('App rendering, authentication state:', { isLoaded, isSignedIn });
  
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
      <DataProvider>
        <CrmProvider>
          <FinancialAnalysisProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crm" element={<CRMDashboard />} />
              <Route path="/clients/:clientId/crm" element={<ClientCRM />} />
              <Route path="/clients" element={<ClientManagement />} />
              <Route path="/clients/:clientId" element={<ClientDetails />} />
              <Route path="/financial-analysis" element={<FinancialAnalysis />} />
              <Route path="/financial-analysis/:clientId" element={<FinancialAnalysis />} />
              <Route path="/clients/:clientId/report" element={<ClientFinancialReport />} />
              <Route path="/proposals" element={<ProposalManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/client-financial-analysis" element={<ClientFinancialAnalysis />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              <Route path="/projections-settings" element={<ProjectionsSettings />} />
              <Route path="/sign-in" element={<Navigate to="/dashboard" replace />} />
              <Route path="/sign-up" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </FinancialAnalysisProvider>
        </CrmProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;