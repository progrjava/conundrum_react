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

const supabase = createClient(supabaseUrl, supabaseKey);

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, email, password, age, occupation, gender } = req.body;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    age: age ? parseInt(age) : null,
                    gender: gender || null,
                    occupation: occupation || null
                }
            }
        });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Можно также сохранить username в базе данных отдельно, если это нужно
        // const { error: profileError } = await supabase.from('profiles').insert({ id: data.user.id, username });

        return res.status(200).json({ message: 'Пользователь зарегистрирован' });
    } catch (err) {
        return res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Логин пользователя
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const { user, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) return res.status(400).json({ error: error.message });

        res.status(200).json({ message: 'Вход успешен!', user });
    } catch (error) {
        res.status(500).json({ error: 'Что-то пошло не так.' });
    }
});

module.exports = router;
