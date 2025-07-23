import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import logDev from '../utils/logDev';
import { useSupabase } from '../lib/supabaseClient';

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
  const { isLoaded, isSignedIn, getToken } = useAuth(); // Add getToken here
  const supabase = useSupabase();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  logDev('AuthProvider rendering, Clerk user:', clerkUser?.id);

  // Update local user state when Clerk user changes
  useEffect(() => {
    const syncAuth = async () => {
      try {
        if (isLoaded) {
          if (isSignedIn && clerkUser && supabase) {
            // STEP 1: Get the JWT token from Clerk using your template
            const token = await getToken({ template: 'supabase' });
            
            if (!token) {
              console.error('No token received from Clerk');
              setLoading(false);
              return;
            }

            // STEP 2: Set the session in Supabase with Clerk's token
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: 'dummy_refresh_token' // Clerk handles refresh
            });
            
            if (sessionError) {
              console.error('Error setting Supabase session:', sessionError);
              setLoading(false);
              return;
            }

            // STEP 3: Now we can safely get the Supabase user
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
            console.log('✅ Supabase session set successfully');

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
  }, [clerkUser, isLoaded, isSignedIn, supabase, getToken]); // Add getToken to dependencies

  // Logout function
  const signOut = async () => {
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
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
