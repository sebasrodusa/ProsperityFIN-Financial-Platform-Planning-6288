import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import logDev from '../utils/logDev';

// Create the auth context
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  logDev('AuthProvider rendering, Clerk user:', clerkUser?.id);

  // Update local user state when Clerk user changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && clerkUser) {
        // Transform Clerk user to our app's user format
        const transformedUser = {
          id: clerkUser.id,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          email: clerkUser.primaryEmailAddress?.emailAddress,
          role: clerkUser.publicMetadata?.role || 'client',
          teamId: clerkUser.publicMetadata?.teamId,
          agentCode: clerkUser.unsafeMetadata?.agentCode,
          avatar: clerkUser.imageUrl,
          phone: clerkUser.unsafeMetadata?.phone,
        };
        setUser(transformedUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  // Logout function
  const logout = async () => {
    // We don't need to call supabase.auth.signOut() as we're using Clerk
    // Just update the local state
    setUser(null);
  };

  // Provide the auth context value
  const value = {
    user,
    loading: loading || !isLoaded,
    isSignedIn,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;