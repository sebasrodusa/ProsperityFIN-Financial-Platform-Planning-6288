import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { DataProvider } from './contexts/DataContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext';
import { CrmProvider } from './contexts/CrmContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
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
import './App.css';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but there was an error loading the application.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// App Routes Component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/sign-in/*" element={<Login />} />
        <Route path="/sign-up/*" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="*"
          element={
            <>
              <SignedIn>
                <Routes>
                  {/* Dashboard Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* CRM Routes */}
                  <Route path="/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><CRMDashboard /></ProtectedRoute>} />
                  <Route path="/clients/:clientId/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><ClientCRM /></ProtectedRoute>} />
                  
                  {/* Client Routes */}
                  <Route path="/client-portal" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />
                  <Route path="/client-financial-analysis" element={<ProtectedRoute allowedRoles={['client']}><ClientFinancialAnalysis /></ProtectedRoute>} />
                  
                  {/* Professional Routes */}
                  <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><ClientManagement /></ProtectedRoute>} />
                  <Route path="/clients/:clientId" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><ClientDetails /></ProtectedRoute>} />
                  <Route path="/financial-analysis" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><FinancialAnalysis /></ProtectedRoute>} />
                  <Route path="/financial-analysis/:clientId" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><FinancialAnalysis /></ProtectedRoute>} />
                  <Route path="/clients/:clientId/report" element={<ClientFinancialReport />} />
                  <Route path="/proposals" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_pro']}><ProposalManagement /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><UserManagement /></ProtectedRoute>} />
                  
                  {/* Admin Routes */}
                  <Route path="/projections-settings" element={<ProtectedRoute allowedRoles={['admin']}><ProjectionsSettings /></ProtectedRoute>} />
                  
                  {/* Settings */}
                  <Route path="/profile-settings" element={<ProfileSettings />} />
                </Routes>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ClerkProvider publishableKey={clerkPubKey}>
        <Router>
          <DataProvider>
            <CrmProvider>
              <FinancialAnalysisProvider>
                <AppRoutes />
              </FinancialAnalysisProvider>
            </CrmProvider>
          </DataProvider>
        </Router>
      </ClerkProvider>
    </ErrorBoundary>
  );
}

export default App;