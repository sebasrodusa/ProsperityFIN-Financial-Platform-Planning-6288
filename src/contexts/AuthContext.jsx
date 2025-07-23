import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import logDev from '../utils/logDev';
import { useSupabaseWithClerk } from '../lib/supabaseClient';

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
  const { isLoaded, isSignedIn } = useAuth();
  const supabase = useSupabaseWithClerk();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  logDev('AuthProvider rendering, Clerk user:', clerkUser?.id);

  // Update local user state when Clerk user changes
  useEffect(() => {
    const syncAuth = async () => {
      try {
        if (isLoaded) {
          if (isSignedIn && clerkUser && supabase) {
            // Add null check for supabase
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
              console.error('Error getting Supabase session:', sessionError);
              setLoading(false);
              return;
            }

            // Retrieve the Supabase authenticated user to get its ID
            const { data: supaData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
              console.error('Error getting Supabase user:', userError);
              setLoading(false);
              return;
            }

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
            // Handle sign out case
            if (supabase) {
              try {
                await supabase.auth.signOut();
              } catch (err) {
                console.error('Error signing out of Supabase:', err);
              }
            }
            setUser(null);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Error in syncAuth:', error);
        setLoading(false);
      }
    };

    syncAuth();
  }, [clerkUser, isLoaded, isSignedIn, supabase]); // Add supabase to dependencies

  // Logout function
  const logout = async () => {
    try {
      setUser(null);
      if (supabase) {
        await supabase.auth.signOut();
      }
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
