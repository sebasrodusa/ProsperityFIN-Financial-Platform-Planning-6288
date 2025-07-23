import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance;

const getClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseInstance;
};

export function useSupabaseClient() {
  return useMemo(() => getClient(), []);
}

export const useSupabase = useSupabaseClient;
export const supabase = getClient();
