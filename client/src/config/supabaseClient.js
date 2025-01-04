import { createClient } from '@supabase/supabase-js';

let supabase = null;

export const initializeSupabase = async () => {
    if (supabase) {
        return supabase;
    }

    try {
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
        const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Missing Supabase configuration');
        }

        supabase = createClient(supabaseUrl, supabaseKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });

        // Проверяем соединение
        const { error } = await supabase.auth.getSession();
        if (error) {
            throw error;
        }

        return supabase;
    } catch (error) {
        console.error('Supabase initialization error:', error);
        throw error;
    }
};

export const getSupabaseClient = async () => {
    if (!supabase) {
        return initializeSupabase();
    }
    return supabase;
};
