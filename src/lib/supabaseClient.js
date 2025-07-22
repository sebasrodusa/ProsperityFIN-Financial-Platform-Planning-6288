// src/supabaseClient.js
//
// Centralized Supabase client used across the app. All modules should import
// this instance rather than creating their own clients.
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { useCallback, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ This default Supabase client should only be used when no auth is needed.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// ✅ Hook that updates Supabase auth using Clerk token
export function useSupabaseWithClerk() {
  const { getToken } = useAuth();

  const setAuth = useCallback(async () => {
    const token = await getToken({ template: 'supabase' });
    if (token) supabase.auth.setAuth(token);
  }, [getToken]);

  useEffect(() => {
    setAuth();
  }, [setAuth]);

  return supabase;
}
