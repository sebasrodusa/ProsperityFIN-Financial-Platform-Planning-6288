import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext';
import { CrmProvider } from './contexts/CrmContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
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
import './App.css';

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

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  // Route clients to their portal instead of the regular dashboard
  if (user?.role === 'client') {
    return <Navigate to="/client-portal" replace />;
  }
  
  return <Dashboard />;
};

// App Routes Component (separated to use hooks inside Router)
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Regular Dashboard for non-client users */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        
        {/* CRM Routes - Not accessible by clients */}
        <Route 
          path="/crm" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <CRMDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients/:clientId/crm" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <ClientCRM />
            </ProtectedRoute>
          } 
        />
        
        {/* Client Portal - Only accessible by clients */}
        <Route 
          path="/client-portal" 
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientPortal />
            </ProtectedRoute>
          } 
        />
        
        {/* Client Financial Analysis - Only accessible by clients */}
        <Route 
          path="/client-financial-analysis" 
          element={
            <ProtectedRoute allowedRoles={['client']}>
              <ClientFinancialAnalysis />
            </ProtectedRoute>
          } 
        />
        
        {/* Professional routes - Not accessible by clients */}
        <Route 
          path="/clients" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <ClientManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/clients/:clientId" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <ClientDetails />
            </ProtectedRoute>
          } 
        />
        
        {/* Consolidated Financial Analysis - accessible from multiple places */}
        <Route 
          path="/financial-analysis" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <FinancialAnalysis />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/financial-analysis/:clientId" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <FinancialAnalysis />
            </ProtectedRoute>
          } 
        />
        
        {/* Financial Report - Accessible by both professionals and clients (for their own data) */}
        <Route 
          path="/clients/:clientId/report" 
          element={
            <ProtectedRoute>
              <ClientFinancialReport />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/proposals" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}>
              <ProposalManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/users" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'manager']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile Settings - Accessible by all authenticated users */}
        <Route 
          path="/profile-settings" 
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <DataProvider>
            <CrmProvider>
              <FinancialAnalysisProvider>
                <AppRoutes />
              </FinancialAnalysisProvider>
            </CrmProvider>
          </DataProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;