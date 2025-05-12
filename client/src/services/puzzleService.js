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
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        // Можно вернуть пустой массив или бросить ошибку, если пользователь не вошел
        console.warn('User not authenticated. Cannot fetch puzzles.');
        return [];
    }

    // RLS-политика автоматически отфильтрует пазлы по auth.uid() = user_id
    const { data, error } = await supabase
        .from('puzzles')
        .select('id, name, game_type, created_at') // Выбираем только нужные поля для списка
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase error fetching puzzles:', error);
        throw error;
    }
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

// Добавь также функции для update и delete по аналогии, если нужно