import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
  return {
    id: authUser.id,
    supabaseId: authUser.id,
    name: profile?.name || authUser.user_metadata?.name || '',
    email: authUser.email,
    role: profile?.role || authUser.user_metadata?.role || 'client',
    teamId: profile?.team_id || authUser.user_metadata?.teamId,
    agentCode: profile?.agent_code || authUser.user_metadata?.agentCode,
    avatar: profile?.avatar || authUser.user_metadata?.avatar_url,
    phone: profile?.phone || authUser.user_metadata?.phone,
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

      const { data, error } = await supabase
        .from('users_pf')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
      }

      setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  const signUp = async ({ email, password, data }) => {
    const { data: result, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data },
    });
    if (error) throw error;
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
  };

  const updateProfile = async (updates) => {
    if (!session?.user) throw new Error('No authenticated user');
    const { data: profile, error } = await supabase
      .from('users_pf')
      .update(updates)
      .eq('id', session.user.id)
      .select()
      .single();
    if (error) throw error;
    return profile;
  };

  const user = transformUser(session?.user, profile);

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const isFinancialProfessional = user?.role === 'financial_professional';
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
    isFinancialProfessional,
    isClient,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
