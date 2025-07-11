import { createClient } from '@supabase/supabase-js';

// Update with correct values from credentials
const SUPABASE_URL = 'https://urzsjigszcdyhmzywvdx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenNqaWdzemNkeWhtenl3dmR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNTYwNzIsImV4cCI6MjA2NzgzMjA3Mn0.3P3unNJJnL9ee6q5UJ_fOwtjp1c65Yz8lhzxa6DY2x4';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export default supabase;