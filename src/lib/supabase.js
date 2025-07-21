import { createClient } from '@supabase/supabase-js'

// Retrieve Supabase credentials from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Create a Supabase client. The anon key is only used for the initial
// connection; the authenticated token is set separately after login.
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export async function setAuthToken(token) {
  if (token) {
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'clerk', token });
    if (error) {
      console.error('Error signing in with ID token:', error);
      throw error;
    }
    return data;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

export default supabase;
