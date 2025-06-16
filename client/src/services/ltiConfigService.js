import { getSupabaseClient } from '../config/supabaseClient';

export const saveLtiConfiguration = async (supabase, resourceLinkId, generationParams) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error("saveLtiConfiguration: getUser() returned null. RLS will fail.");
        throw new Error('User not authenticated for saving config.');
    }

    console.log(`Saving config for user ${user.id} and resource ${resourceLinkId}`);

    const { error } = await supabase
        .from('lti_configurations')
        .upsert({ 
            resource_link_id: resourceLinkId, 
            generation_params: generationParams,
            user_id: user.id
        }, { onConflict: 'resource_link_id' });

    if (error) {
        console.error("Supabase upsert error:", error);
        throw error;
    }
};

export const getLtiConfiguration = async (supabase, resourceLinkId) => {
    const { data, error } = await supabase
        .from('lti_configurations')
        .select('generation_params')
        .eq('resource_link_id', resourceLinkId)
        .single();

    if (error) {
        // Если не найдено, это не ошибка, просто возвращаем null
        if (error.code === 'PGRST116') return null; 
        throw error;
    }
    return data ? data.generation_params : null;
};