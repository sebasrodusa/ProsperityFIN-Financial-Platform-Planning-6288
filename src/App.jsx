import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import './App.css';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ClientManagement from './pages/ClientManagement';
import ClientDetails from './pages/ClientDetails';
import FinancialAnalysis from './pages/FinancialAnalysis';

// Import components
import LoadingSpinner from './components/ui/LoadingSpinner';

function App() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  
  // Show loading spinner while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isSignedIn ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/sign-up" element={!isSignedIn ? <Signup /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={isSignedIn ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route path="/clients" element={isSignedIn ? <ClientManagement /> : <Navigate to="/login" replace />} />
      <Route path="/clients/:clientId" element={isSignedIn ? <ClientDetails /> : <Navigate to="/login" replace />} />
      <Route path="/financial-analysis" element={isSignedIn ? <FinancialAnalysis /> : <Navigate to="/login" replace />} />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to={isSignedIn ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to={isSignedIn ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;