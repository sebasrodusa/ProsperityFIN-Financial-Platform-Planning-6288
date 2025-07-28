import React, { createContext, useContext, useEffect, useState } from 'react';
import { getProfileImageUrl } from '../utils/profileImage';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return ctx;
};

const transformUser = (authUser, profile) => {
  if (!authUser) return null;
  
  // Use the profile ID if it exists, otherwise use auth user ID
  const userId = profile?.id || authUser.id;
  
  return {
    id: userId, // This should be the ID from users_pf if it exists
    supabaseId: authUser.id, // Always keep the original auth ID for reference
    authId: authUser.id, // Explicit auth ID for clarity
    name: profile?.name || authUser.user_metadata?.name || '',
    email: authUser.email,
    role: profile?.role || authUser.user_metadata?.role || 'client',
    teamId: profile?.team_id || authUser.user_metadata?.teamId,
    agentCode: profile?.agent_code || authUser.user_metadata?.agentCode,
    
    avatar: profile?.avatar || authUser.user_metadata?.avatar_url,
    profileImageUrl: profile?.profile_image_url,
    phone: profile?.phone || authUser.user_metadata?.phone,
    imageUrl: getProfileImageUrl({ profileImageUrl: profile?.profile_image_url, avatar: profile?.avatar || authUser.user_metadata?.avatar_url }),
  };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load the user's profile to get the latest role
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        // First try to find by auth ID
        let { data, error } = await supabase
          .from('users_pf')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        // If not found by ID, try by email (for legacy users)
        if (!data && session.user.email) {
          console.log('User not found by ID, trying email lookup...');
          const emailResult = await supabase
            .from('users_pf')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();
          
          data = emailResult.data;
          error = emailResult.error;
        }

        // If still no profile exists, create one
        if (!data && !error) {
          console.log('Creating new user profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('users_pf')
            .insert({
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              role: session.user.user_metadata?.role || 'client',
              team_id: session.user.user_metadata?.teamId,
              agent_code: session.user.user_metadata?.agentCode,
              avatar: session.user.user_metadata?.avatar_url,
              phone: session.user.user_metadata?.phone,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user profile:', createError);
            // If insert fails due to duplicate email, try to update the existing record
            if (createError.code === '23505') { // Unique constraint violation
              console.log('User exists with different ID, updating...');
              const { data: updatedProfile, error: updateError } = await supabase
                .from('users_pf')
                .update({
                  auth_id: session.user.id, // Store the auth ID for reference
                  updated_at: new Date().toISOString()
                })
                .eq('email', session.user.email)
                .select()
                .single();
              
              if (!updateError) {
                data = updatedProfile;
              } else {
                console.error('Error updating user profile:', updateError);
              }
            }
          } else {
            data = newProfile;
          }
        }

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
          console.error('Error fetching user profile:', error);
        }

        setProfile(data);
      } catch (err) {
        console.error('Unexpected error in fetchProfile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  const signUp = async ({ email, password, data }) => {
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login`, data },
    });
    
    if (error) throw error;
    
    // After successful signup, create the user profile
    if (result?.user) {
      try {
        const { error: profileError } = await supabase
          .from('users_pf')
          .insert({
            id: result.user.id,
            email: result.user.email,
            name: data?.name || email.split('@')[0],
            role: data?.role || 'client',
            team_id: data?.teamId,
            agent_code: data?.agentCode,
            avatar: data?.avatar_url,
            phone: data?.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (profileError) {
          console.error('Error creating user profile during signup:', profileError);
        }
      } catch (err) {
        console.error('Error in signup profile creation:', err);
      }
    }
    
    return result;
  };

  const signIn = async ({ email, password }) => {
    const { data: result, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return result;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };

  const updateProfile = async (updates) => {
    if (!session?.user) throw new Error('No authenticated user');
    
    // Update using the profile ID if it exists, otherwise use auth ID
    const userId = profile?.id || session.user.id;
    
    const { data: updatedProfile, error } = await supabase
      .from('users_pf')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    
    setProfile(updatedProfile);
    return updatedProfile;
  };

  const user = transformUser(session?.user, profile);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isAdvisor = user?.role === 'advisor';
  const isClient = user?.role === 'client';

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);

  const value = {
    user,
    loading,
    isSignedIn: !!session,
    supabase,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAdmin,
    isManager,
    isAdvisor,
    isClient,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
