const { createClient } = require('@supabase/supabase-js');
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

class QueueService {
    static async enqueueGrade(data) {
        const { outcome_url, sourcedid, score } = data;
        
        const { error } = await supabaseAdmin
            .from('lti_grades_queue')
            .insert([{
                outcome_service_url: outcome_url,
                result_sourcedid: sourcedid,
                normalized_score: score,
                status: 'pending'
            }]);

        if (error) throw error;
        console.log('Queue: Задача на отправку оценки добавлена в очередь.');
    }
}

module.exports = QueueService;