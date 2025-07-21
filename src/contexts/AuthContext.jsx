import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import logDev from '../utils/logDev';
import supabase, { setAuthToken } from '../lib/supabase';

// Create the auth context
const AuthContext = createContext();

// Custom hook for using the auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const { user: clerkUser } = useUser();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  logDev('AuthProvider rendering, Clerk user:', clerkUser?.id);

  // Update local user state when Clerk user changes
  useEffect(() => {
    const syncAuth = async () => {
      if (isLoaded) {
        if (isSignedIn && clerkUser) {
          const token = await getToken({ template: 'supabase' });
          try {
            const signInData = await setAuthToken(token);
            if (!signInData?.user) {
              throw new Error('Supabase sign-in did not return a user');
            }
          } catch (err) {
            console.error('Failed to authenticate with Supabase:', err);
            setLoading(false);
            return;
          }
          // Retrieve the Supabase authenticated user to get its ID
          const { data: supaData } = await supabase.auth.getUser();
          const supabaseId = supaData?.user?.id;
          // Transform Clerk user to our app's user format
          const transformedUser = {
            id: clerkUser.id,
            supabaseId,
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            email: clerkUser.primaryEmailAddress?.emailAddress,
            role: clerkUser.publicMetadata?.role || 'client',
            teamId: clerkUser.publicMetadata?.teamId,
            agentCode: clerkUser.unsafeMetadata?.agentCode,
            avatar: clerkUser.imageUrl,
            phone: clerkUser.unsafeMetadata?.phone,
          };
          logDev('Clerk publicMetadata:', clerkUser.publicMetadata);
          logDev('Resolved user role:', transformedUser.role);
          console.log('👀 Clerk publicMetadata:', clerkUser.publicMetadata);
console.log('✅ Resolved user role:', transformedUser.role);
          setUser(transformedUser);
        } else {
          try {
            await setAuthToken(null);
          } catch (err) {
            console.error('Error signing out of Supabase:', err);
          }
          setUser(null);
        }
        setLoading(false);
      }
    };
    syncAuth();
  }, [clerkUser, isLoaded, isSignedIn]);

  // Logout function
const logout = async () => {
  // We don't need to call supabase.auth.signOut() as we're using Clerk
  // Just update the local state
  setUser(null);
  try {
    await setAuthToken(null);
  } catch (err) {
    console.error('Error signing out of Supabase:', err);
  }
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
