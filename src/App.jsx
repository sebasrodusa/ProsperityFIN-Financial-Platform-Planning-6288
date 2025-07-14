import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import ClerkProviderWithRoutes from './components/auth/ClerkProviderWithRoutes';
import PrivateRoute from './components/auth/PrivateRoute';
import { DataProvider } from './contexts/DataContext';
import { FinancialAnalysisProvider } from './contexts/FinancialAnalysisContext';
import { CrmProvider } from './contexts/CrmContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminSignup from './pages/AdminSignup';
import { routes } from './config/routes';
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

// App Routes Component
const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/sign-in" element={<Login />} />
        <Route path="/sign-up" element={<Signup />} />
        <Route path="/admin-signup" element={<AdminSignup />} />

        {/* Protected Routes */}
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              route.requireAuth ? (
                <SignedIn>
                  <PrivateRoute allowedRoles={route.allowedRoles}>
                    {route.element}
                  </PrivateRoute>
                </SignedIn>
              ) : (
                route.element
              )
            }
          />
        ))}

        {/* Catch all route - redirect to sign in */}
        <Route
          path="*"
          element={
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
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
        <ClerkProviderWithRoutes>
          <DataProvider>
            <CrmProvider>
              <FinancialAnalysisProvider>
                <AppRoutes />
              </FinancialAnalysisProvider>
            </CrmProvider>
          </DataProvider>
        </ClerkProviderWithRoutes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;