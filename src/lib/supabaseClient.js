import { createClient } from '@supabase/supabase-js';
import { useMemo } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function useSupabase() {
  return useMemo(() => supabase, []);
}

export default useSupabase;
