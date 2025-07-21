// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ This default Supabase client should only be used when no auth is needed.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ✅ This hook returns an **authenticated** Supabase client using Clerk's token
export function useSupabaseWithClerk() {
  const { getToken } = useAuth();

  const getSupabaseClient = async () => {
    const token = await getToken({ template: 'supabase' });

    if (!token) {
      console.warn('No Clerk token available for Supabase auth.');
    }

    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
  };

  return { getSupabaseClient };
}
