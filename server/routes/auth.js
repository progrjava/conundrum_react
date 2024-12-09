const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();
require('dotenv').config();
const supabaseUrl = 'https://uffvbtwucwzfwnzivqos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZnZidHd1Y3d6Zndueml2cW9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5NzU5NTAsImV4cCI6MjA0NjU1MTk1MH0.QOddSnAWTv3cvLLhVVaZfLoHP7Xniw5l6UaY8SXbR7o';

if (!supabaseUrl || !supabaseKey) {
    console.error('Ошибка: переменные SUPABASE_URL или SUPABASE_KEY не определены.');
    process.exit(1); // Остановить выполнение сервера
}

/*const supabase = createClient(supabaseUrl, supabaseKey);*/

let supabase;

function initSupabase() {
    try {

        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Не получены URL или ключ Supabase от сервера");
        }

        // Создаем клиент Supabase
        supabase = createClient(supabaseUrl, supabaseKey);

        // Устанавливаем слушатель изменений состояния аутентификации
        /*supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                console.log('Пользователь авторизован');
            } else if (event === 'SIGNED_OUT') {
                console.log('Пользователь вышел из системы');
            }
        });*/
    } catch (error) {
        console.error('Ошибка инициализации Supabase:', error);
    }
}

// Запускаем инициализацию при загрузке модуля
initSupabase();

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, email, password, birthdate, occupation, gender } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    birthdate: birthdate || null,
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
        const { user, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            return res.status(400).json({ error: 'Неверные учетные данные' });
        } 
        
        res.status(200).json({ 
            message: 'Вход успешен!',
        });
        
 
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});


router.get('/profile', async (req, res) => {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
            return res.status(400).json({ error: error.message });
        }
        res.status(200).json({ user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});

// Выход пользователя
router.post('/logout', async (req, res) => {
    try {
        await supabase.auth.signOut();
        res.status(200).json({ message: 'Выход успешен!' });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});


// Обновление данных пользователя
router.put('/update', async (req, res) => {
    const { username, birthdate, occupation, gender } = req.body;

    try {
        const { data, error } = await supabase.auth.updateUser({
            data: { 
                username: username,
                birthdate: birthdate,
                occupation: occupation,
                gender: gender,
            },
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ message: 'Данные успешно обновлены', user: data });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера при обновлении данных.' });
    }
});


module.exports = router;

