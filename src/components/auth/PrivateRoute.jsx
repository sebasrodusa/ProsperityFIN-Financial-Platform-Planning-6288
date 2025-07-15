import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import LoadingSpinner from '../ui/LoadingSpinner';

const PrivateRoute = ({ children, allowedRoles = [], requireAuth = true }) => {
  const { user, isLoaded, isSignedIn } = useUser();
  const location = useLocation();

  // Show loading spinner while Clerk loads
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If auth is required and user isn't signed in, redirect to login
  if (requireAuth && !isSignedIn) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // If we have role restrictions
  if (allowedRoles.length > 0) {
    const userRole = user?.publicMetadata?.role;
    
    // If user has no role or unauthorized role
    if (!userRole || !allowedRoles.includes(userRole)) {
      // Redirect all unauthorized roles to the main dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default PrivateRoute;