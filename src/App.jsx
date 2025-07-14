import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

// Import providers
import AuthProvider from './contexts/AuthContext';
import DataProvider from './contexts/DataContext';
import CrmProvider from './contexts/CrmContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext'; // Change to named import

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import Dashboard from './pages/Dashboard';
// ... rest of the imports ...

function App() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  
  console.log('App rendering, authentication state:', { isLoaded, isSignedIn });
  
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
              {/* ... routes ... */}
            </Routes>
          </FinancialAnalysisProvider>
        </CrmProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;