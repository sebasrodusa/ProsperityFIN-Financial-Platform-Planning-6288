import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase;

export function useSupabaseWithClerk() {
  let getToken;
  try {
    ({ getToken } = useAuth());
  } catch {
    getToken = async () => null;
  }

  const getSupabaseClient = async () => {
    const token = await getToken({ template: 'supabase' });
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  };

  return { getSupabaseClient };
}
