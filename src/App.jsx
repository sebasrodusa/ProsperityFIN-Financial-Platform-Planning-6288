import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

// Import providers
import AuthProvider from './contexts/AuthContext';
import DataProvider from './contexts/DataContext';
import CrmProvider from './contexts/CrmContext';
import FinancialAnalysisProvider from './contexts/FinancialAnalysisContext';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
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

// Import components
import LoadingSpinner from './components/ui/LoadingSpinner';

import './App.css';

function App() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  
  console.log('App rendering, authentication state:', { isLoaded, isSignedIn });
  
  // Show loading spinner while Clerk loads
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
        <Route path="/login" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
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
              {/* Dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* CRM Routes */}
              <Route path="/crm" element={<CRMDashboard />} />
              <Route path="/clients/:clientId/crm" element={<ClientCRM />} />
              
              {/* Client Routes */}
              <Route path="/clients" element={<ClientManagement />} />
              <Route path="/clients/:clientId" element={<ClientDetails />} />
              <Route path="/clients/:clientId/report" element={<ClientFinancialReport />} />
              
              {/* Financial Analysis Routes */}
              <Route path="/financial-analysis" element={<FinancialAnalysis />} />
              <Route path="/financial-analysis/:clientId" element={<FinancialAnalysis />} />
              
              {/* Client Portal */}
              <Route path="/client-portal" element={<ClientPortal />} />
              <Route path="/client-financial-analysis" element={<ClientFinancialAnalysis />} />
              
              {/* Proposals */}
              <Route path="/proposals" element={<ProposalManagement />} />
              
              {/* User Management */}
              <Route path="/users" element={<UserManagement />} />
              
              {/* Settings */}
              <Route path="/projections-settings" element={<ProjectionsSettings />} />
              <Route path="/profile-settings" element={<ProfileSettings />} />
              
              {/* Redirects */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </FinancialAnalysisProvider>
        </CrmProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;