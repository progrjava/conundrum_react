import { createClient } from '@supabase/supabase-js';

let supabase = null;
let initializationPromise = null;

export const initializeSupabase = async () => {
    if (supabase) {
        return supabase;
    }

    if (!initializationPromise) {
        initializationPromise = (async () => {
            try {
                console.log('Fetching Supabase configuration...');
                const response = await fetch('/api/config');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`Failed to fetch Supabase configuration: ${errorData.error || response.status}`);
                }
                
                const config = await response.json();
                console.log('Supabase configuration received');
                
                if (!config.supabaseUrl || !config.supabaseKey) {
                    throw new Error("Missing Supabase URL or key from server configuration");
                }

                supabase = createClient(config.supabaseUrl, config.supabaseKey, {
                    auth: {
                        storageKey: 'supabase.auth.token',
                        storage: window.localStorage,
                        autoRefreshToken: true,
                        persistSession: true,
                        detectSessionInUrl: true
                    }
                });

                console.log('Supabase client initialized successfully');
                return supabase;
            } catch (error) {
                console.error('Supabase initialization error:', error);
                initializationPromise = null;
                throw error;
            }
        })();
    }

    return initializationPromise;
};

export const getSupabaseClient = async () => {
    if (!supabase) {
        return initializeSupabase();
    }
    return supabase;
};
