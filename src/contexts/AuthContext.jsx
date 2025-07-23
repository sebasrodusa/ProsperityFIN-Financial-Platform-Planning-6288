import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const AuthContext = createContext(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (id) => {
    const { data, error } = await supabase
      .from('users_pf')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to load profile', error);
      return;
    }

    setProfile(data);
    setUser((u) => ({ ...u, role: data.role }));
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session?.user) {
        setUser({ ...session.user, supabaseId: session.user.id });
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ ...session.user, supabaseId: session.user.id });
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async ({ email, password, ...metadata }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');
    const { data, error } = await supabase
      .from('users_pf')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    if (error) throw error;
    setProfile(data);
    setUser((u) => ({ ...u, role: data.role }));
    return data;
  };

  const role = profile?.role;
  const isAdmin = role === 'admin';
  const isManager = role === 'manager';
  const isFinancialProfessional = role === 'financial_professional';
  const isClient = role === 'client';
  const hasRole = (r) => role === r;
  const hasAnyRole = (roles) => roles.includes(role);

  const value = {
    supabase,
    user,
    profile,
    loading,
    isSignedIn: !!user,
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
    role
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

