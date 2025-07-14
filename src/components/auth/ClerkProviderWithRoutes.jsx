import React from 'react';
import { ClerkProvider } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const ClerkProviderWithRoutes = ({ children }) => {
  const navigate = useNavigate();
  
  // Get Clerk configuration from environment variables
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error('Missing Clerk configuration. Please check your environment variables.');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
          <p className="text-gray-600">Missing Clerk authentication configuration.</p>
          <p className="text-sm text-gray-500 mt-2">Please check your environment variables:</p>
          <ul className="text-sm text-gray-500 mt-1">
            {!CLERK_PUBLISHABLE_KEY && <li>VITE_CLERK_PUBLISHABLE_KEY is missing</li>}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      loading={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </ClerkProvider>
  );
};

export default ClerkProviderWithRoutes;