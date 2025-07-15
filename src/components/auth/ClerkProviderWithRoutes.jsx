import React, { useState, useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../ui/LoadingSpinner';

const ClerkProviderWithRoutes = ({ children }) => {
  const navigate = useNavigate();
  const { isLoaded } = useAuth();
  const [initError, setInitError] = useState(null);
  
  // Get Clerk configuration from environment variables
  const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;


  useEffect(() => {
    if (isLoaded || initError) return;
    const timer = setTimeout(() => {
      if (!isLoaded) {
        setInitError('Failed to initialize authentication. Please check your environment variables or domain configuration.');
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [isLoaded, initError]);

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

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
          <p className="text-gray-600">{initError}</p>
          <p className="text-sm text-gray-500 mt-2">Please check your environment variables or domain configuration.</p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY}
      navigate={(to) => navigate(to)}
      onError={(err) => {
        console.error('Clerk initialization error:', err);
        setInitError(err.errors?.[0]?.longMessage || err.message || 'Unknown error');
      }}
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