import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance;

function createStubClient() {
  const stub = new Proxy(function () {}, {
    get: () => stub,
    apply: () => Promise.resolve({}),
  });
  return stub;
}

const getClient = () => {
  if (!supabaseInstance) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error(
        'Missing Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      supabaseInstance = createStubClient();
    } else {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  }
  return supabaseInstance;
};

export function useSupabaseClient() {
  return useMemo(() => getClient(), []);
}

export const useSupabase = useSupabaseClient;
export const supabase = getClient();
