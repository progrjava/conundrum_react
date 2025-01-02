import { createClient } from '@supabase/supabase-js';

let supabase = null;
let initializationPromise = null;

const initializeSupabase = async () => {
    if (supabase) {
        return supabase;
    }

    try {
        const response = await fetch('http://localhost:5000/auth/supabase-config');
        if (!response.ok) {
            throw new Error(`Failed to fetch Supabase configuration: ${response.status}`);
        }
        
        const config = await response.json();
        
        if (!config.supabaseUrl || !config.supabaseKey) {
            throw new Error("Missing Supabase URL or key from server");
        }

        // Initialize with specific options for session handling
        supabase = createClient(config.supabaseUrl, config.supabaseKey, {
            auth: {
                storageKey: 'supabase.auth.token',
                storage: window.localStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        // Verify session initialization
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
            console.error('Session initialization error:', error);
        } else {
            console.log('Session initialized:', !!session);
        }

        return supabase;
    } catch (error) {
        console.error('Supabase initialization error:', error);
        throw error;
    }
};

export const getSupabaseClient = async () => {
    if (!initializationPromise) {
        initializationPromise = initializeSupabase();
    }
    return initializationPromise;
};

// Export the initialization function for components that need to wait for Supabase
export const waitForSupabase = initializeSupabase;
