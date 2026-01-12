require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { sendGradeToMoodle } = require('./services/ltiService');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function processQueue() {
    console.log('Worker: Проверка очереди...');

    // 1. Берем задачи, которые пора выполнять
    const { data: tasks, error } = await supabase
        .from('lti_grades_queue')
        .select('*')
        .eq('status', 'pending')
        .lte('next_attempt_at', new Date().toISOString())
        .limit(5); // Берем по 5 штук за раз

    if (error || !tasks.length) return;

    for (const task of tasks) {
        try {
            // Помечаем как "в работе"
            await supabase.from('lti_grades_queue').update({ status: 'processing' }).eq('id', task.id);

            // Пытаемся отправить в Moodle
            await sendGradeToMoodle(
                task.outcome_service_url,
                task.result_sourcedid,
                task.normalized_score,
                1.0, // totalScore уже нормализован
                process.env.LTI_KEY,
                process.env.LTI_SECRET
            );

            // Успех!
            await supabase.from('lti_grades_queue').update({ status: 'completed', error_log: null }).eq('id', task.id);
            console.log(`Worker: Задача ${task.id} выполнена!`);

        } catch (err) {
            // Ошибка -> планируем повтор через 5 минут
            const nextAttempt = new Date(Date.now() + 5 * 60000);
            const newStatus = task.attempts >= 5 ? 'failed' : 'pending';

            await supabase.from('lti_grades_queue').update({
                status: newStatus,
                attempts: task.attempts + 1,
                next_attempt_at: nextAttempt.toISOString(),
                error_log: err.message
            }).eq('id', task.id);

            console.error(`Worker: Ошибка в задаче ${task.id}. Попытка ${task.attempts + 1}`);
        }
    }
}

// Запускаем цикл раз в 30 секунд
setInterval(processQueue, 30000);
console.log('Worker запущен и слушает очередь Supabase...');