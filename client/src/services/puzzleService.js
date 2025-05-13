// src/services/puzzleService.js
import { getSupabaseClient } from '../config/supabaseClient';

export const savePuzzleToSupabase = async (puzzleDataToSave) => {
    const supabase = await getSupabaseClient();
    // Получаем текущего пользователя Supabase, чтобы убедиться, что он есть
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        throw new Error(userError?.message || 'User not authenticated. Cannot save puzzle.');
    }

    // Добавляем user_id к данным пазла
    const dataWithUserId = {
        ...puzzleDataToSave,
        user_id: user.id
    };

    const { data, error } = await supabase
        .from('puzzles')
        .insert([dataWithUserId]) // insert ожидает массив объектов
        .select(); // Возвращаем вставленные данные

    if (error) {
        console.error('Supabase error saving puzzle:', error);
        throw error; // Пробрасываем ошибку для обработки в компоненте
    }
    return data ? data[0] : null; // Возвращаем первый (и единственный) вставленный пазл
};

export const getUserPuzzlesFromSupabase = async () => {
    const supabase = await getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('getUserPuzzlesFromSupabase: User not authenticated, returning empty array.');
        return [];
    }

    console.log(`getUserPuzzlesFromSupabase: Fetching puzzles for user_id: ${user.id}`);

    const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('user_id', user.id) // Фильтруем по user_id
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching user puzzles from Supabase:', error);
        throw error;
    }

    console.log('getUserPuzzlesFromSupabase: Fetched puzzles:', data);
    return data || [];
};

export const getPuzzleByIdFromSupabase = async (puzzleId) => {
    const supabase = await getSupabaseClient();
    // RLS-политика также сработает здесь, пользователь сможет получить только свой пазл
    const { data, error } = await supabase
        .from('puzzles')
        .select('*')
        .eq('id', puzzleId)
        .single(); // Ожидаем одну запись

    if (error) {
        console.error('Supabase error fetching puzzle by ID:', error);
        // Если ошибка "PGRST116" (0 rows), значит пазл не найден или не принадлежит пользователю
        if (error.code === 'PGRST116') {
             throw new Error('Puzzle not found or access denied.');
        }
        throw error;
    }
    return data;
};

// export const deletePuzzleFromSupabase = async (puzzleId) => {
//     const supabase = await getSupabaseClient();
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//         throw new Error('Пользователь не авторизован');
//     }

//     const { error } = await supabase
//         .from('puzzles')
//         .delete()
//         .eq('id', puzzleId)
//         .eq('user_id', user.id); // Убедимся, что пользователь удаляет только свои пазлы

//     if (error) {
//         console.error('Error deleting puzzle from Supabase:', error);
//         throw error;
//     }

//     console.log(`Puzzle ${puzzleId} deleted successfully`);
//     return true;
// };

// Добавь также функции для update и delete по аналогии, если нужно