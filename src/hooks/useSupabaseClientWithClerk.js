import { useMemo } from 'react';
import { useAuth } from '@clerk/clerk-react';
import supabase from '../lib/supabase';

let patched = false;

export default function useSupabaseClientWithClerk() {
  let getToken;
  try {
    ({ getToken } = useAuth());
  } catch {
    getToken = async () => null;
  }

  return useMemo(() => {
    if (!supabase.auth || !supabase.auth.getSession) {
      return supabase;
    }

    if (!patched) {
      const originalGetSession = supabase.auth.getSession.bind(supabase.auth);
      supabase.auth.getSession = async (...args) => {
        const token = await getToken({ template: 'supabase' });
        if (!token) {
          await supabase.auth.signOut();
          return { data: { session: null }, error: null };
        }
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token
        });
        if (error) {
          console.error('Error setting Supabase session:', error);
        }
        return originalGetSession(...args);
      };
      patched = true;
    }
    return supabase;
  }, [getToken]);
}
