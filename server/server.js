require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');
const { initializeLTI } = require('./middleware/ltiMiddleware');
const { validateLTIRequest } = initializeLTI();
const { sendGradeToMoodle } = require('./services/ltiService');
const { generateGamePdf } = require('./services/pdfGeneratorService');
const apiRoutes = require('./routes');

const app = express();
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

app.use(cors({ origin: process.env.ALLOWED_ORIGINS, methods: ['GET', 'POST'], credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));
// Body parsers нужны глобально
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(session({
    secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: true,
    cookie: { secure: true, sameSite: 'none', httpOnly: true, maxAge: 86400000 }
}));

// === ПОДКЛЮЧЕНИЕ ВСЕХ API РОУТОВ ОДНОЙ СТРОКОЙ ===
app.use('/api', apiRoutes);

// === LTI и PDF ===

app.post('/api/lti/submit-score', async (req, res) => {
    if (!req.session?.lti) return res.status(403).json({ error: 'No LTI session' });
    try {
        const { score, totalScore } = req.body;
        await sendGradeToMoodle(
            req.session.lis_outcome_service_url,
            req.session.lis_result_sourcedid,
            parseFloat(score), parseFloat(totalScore),
            process.env.LTI_KEY, process.env.LTI_SECRET
        );
        res.json({ message: 'Score submitted' });
    } catch (e) { res.status(500).json({ error: 'Score submission failed' }); }
});

app.post('/api/generate-pdf', async (req, res) => {
    try {
        const pdfBuffer = await generateGamePdf({ ...req.body.gameData, name: req.body.gameName });
        const safeName = encodeURIComponent(req.body.gameName || 'game').replace(/[^a-zA-Z0-9-_.]/g, '_');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}.pdf"`);
        res.send(pdfBuffer);
    } catch (e) { res.status(500).json({ error: 'PDF Error' }); }
});

app.post('/lti/launch', validateLTIRequest, async (req, res) => {
    try {
        const { userId, lis_person_contact_email_primary: email, lis_person_name_full: name, roles } = req.session;
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
        let user = users.find(u => u.user_metadata.moodle_id === userId);
        
        if (!user) {
            const { data } = await supabaseAdmin.auth.admin.createUser({
                email, email_confirm: true, user_metadata: { full_name: name, moodle_id: userId, roles }
            });
            user = data.user;
        }
        
        const token = jwt.sign({ sub: user.id, aud: 'authenticated' }, process.env.SUPABASE_JWT_SECRET, { expiresIn: '1h' });
        const redirectUrl = new URL(process.env.CLIENT_URL + '/gamegenerator');
        redirectUrl.searchParams.append('supabase_token', token);
        redirectUrl.searchParams.append('lti', 'true');
        redirectUrl.searchParams.append('mode', roles?.toLowerCase().includes('instructor') ? 'configure' : 'solve');
        
        res.redirect(redirectUrl.toString());
    } catch (e) { console.error(e); res.status(500).send("LTI Error"); }
});

app.listen(process.env.PORT || 5000, () => console.log(`Server started`));