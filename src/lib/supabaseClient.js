// src/lib/supabaseClient.js - FIXED VERSION
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single Supabase client instance
let supabaseInstance = null;

export function useSupabase() {
  const { getToken, isLoaded } = useAuth();
  const [supabaseClient, setSupabaseClient] = useState(null);

  useEffect(() => {
    const initializeClient = async () => {
      if (!isLoaded) return;

      try {
        const token = await getToken({ template: 'supabase' });
        
        // Create client only once with custom auth handling
        if (!supabaseInstance) {
          supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            global: {
              headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
              },
            },
            auth: {
              persistSession: false, // Let Clerk handle session persistence
            },
          });
        } else {
          // Update the authorization header for existing client
          supabaseInstance.rest.headers.Authorization = token ? `Bearer ${token}` : undefined;
        }
        
        setSupabaseClient(supabaseInstance);
      } catch (error) {
        console.error('Error initializing Supabase client:', error);
      }
    };

    initializeClient();
  }, [getToken, isLoaded]);

  return supabaseClient; // Return the client directly
}

// Alternative: Keep your current approach but fix the usage
export function useSupabaseWithClerkAsync() {
  const { getToken } = useAuth();
  
  const getSupabaseClient = async () => {
    const token = await getToken({ template: 'supabase' });
    
    // Create client only once with custom auth handling
    if (!supabaseInstance) {
      supabaseInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        },
        auth: {
          persistSession: false, // Let Clerk handle session persistence
        },
      });
    } else {
      // Update the authorization header for existing client
      supabaseInstance.rest.headers.Authorization = token ? `Bearer ${token}` : undefined;
    }
    
    return supabaseInstance;
  };
  
  return { getSupabaseClient };
}
