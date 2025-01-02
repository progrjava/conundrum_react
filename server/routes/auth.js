const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Ошибка: переменные SUPABASE_URL или SUPABASE_KEY не определены.');
    process.exit(1); // Остановить выполнение сервера
}

let supabase;

function initSupabase() {
    try {
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Не получены URL или ключ Supabase от сервера");
        }
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        console.error('Ошибка инициализации Supabase:', error);
    }
}

initSupabase();

// Endpoint для получения конфигурации Supabase
router.get('/supabase-config', (req, res) => {
    console.log('Supabase config requested');
    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials');
        return res.status(500).json({ error: 'Server configuration error' });
    }
    console.log('Sending Supabase config:', { 
        supabaseUrl, 
        hasKey: !!supabaseKey 
    });
    res.json({
        supabaseUrl,
        supabaseKey,
    });
});

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, email, password, occupation, gender } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    gender: gender || null,
                    occupation: occupation || null
                }
            }
        });
        if (error) {
            return res.status(400).json({ error: 'Пользователь уже зарегистрирован' });
        }
        
        return res.status(200).json({ message: 'Пользователь зарегистрирован'});
    } catch (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Логин пользователя
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({ 
            email, 
            password 
        });
        
        if (error) {
            return res.status(400).json({ error: 'Неверные учетные данные' });
        } 
        
        res.status(200).json({ 
            message: 'Вход успешен!',
            user
        });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});

// Получение профиля пользователя
router.get('/profile', async (req, res) => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});

// Выход пользователя
router.post('/logout', async (req, res) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ message: 'Выход успешен!' });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});

// Обновление данных пользователя
router.put('/update', async (req, res) => {
    const { username, occupation, gender } = req.body;

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: { 
                username,
                occupation,
                gender,
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Данные успешно обновлены', user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при обновлении данных.' });
    }
});

module.exports = router;
