import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext';
import { CrmProvider } from './contexts/CrmContext'; // Added import
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CRMDashboard from './pages/CRMDashboard';
import ClientCRM from './pages/ClientCRM';
import ClientManagement from './pages/ClientManagement';
import ClientDetails from './pages/ClientDetails';
import FinancialEvaluation from './pages/FinancialEvaluation';
import FinancialAnalysis from './pages/FinancialAnalysis';
import ClientFinancialReport from './pages/ClientFinancialReport';
import ProposalManagement from './pages/ProposalManagement';
import UserManagement from './pages/UserManagement';
import ClientPortal from './pages/ClientPortal';
import ClientFinancialAnalysis from './pages/ClientFinancialAnalysis';
import ProfileSettings from './pages/ProfileSettings';
import './App.css';

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  // Route clients to their portal instead of the regular dashboard
  if (user?.role === 'client') {
    return <Navigate to="/client-portal" replace />;
  }

  return <Dashboard />;
};

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <CrmProvider>
          <FinancialAnalysisProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />

                  {/* Regular Dashboard for non-client users */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

                  {/* CRM Routes - Not accessible by clients */}
                  <Route path="/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><CRMDashboard /></ProtectedRoute>} />
                  <Route path="/clients/:clientId/crm" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><ClientCRM /></ProtectedRoute>} />

                  {/* Client Portal - Only accessible by clients */}
                  <Route path="/client-portal" element={<ProtectedRoute allowedRoles={['client']}><ClientPortal /></ProtectedRoute>} />

                  {/* Client Financial Analysis - Only accessible by clients */}
                  <Route path="/client-financial-analysis" element={<ProtectedRoute allowedRoles={['client']}><ClientFinancialAnalysis /></ProtectedRoute>} />

                  {/* Professional routes - Not accessible by clients */}
                  <Route path="/clients" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><ClientManagement /></ProtectedRoute>} />
                  <Route path="/clients/:clientId" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><ClientDetails /></ProtectedRoute>} />
                  <Route path="/clients/:clientId/evaluation" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><FinancialEvaluation /></ProtectedRoute>} />

                  {/* Financial Report - Accessible by both professionals and clients (for their own data) */}
                  <Route path="/clients/:clientId/report" element={<ProtectedRoute><ClientFinancialReport /></ProtectedRoute>} />
                  <Route path="/financial-analysis" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><FinancialAnalysis /></ProtectedRoute>} />
                  <Route path="/proposals" element={<ProtectedRoute allowedRoles={['admin', 'manager', 'financial_professional']}><ProposalManagement /></ProtectedRoute>} />
                  <Route path="/users" element={<ProtectedRoute allowedRoles={['admin', 'manager']}><UserManagement /></ProtectedRoute>} />

                  {/* Profile Settings - Accessible by all authenticated users */}
                  <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                </Routes>
              </div>
            </Router>
          </FinancialAnalysisProvider>
        </CrmProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;