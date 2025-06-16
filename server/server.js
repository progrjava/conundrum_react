require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const { initializeLTI } = require('./middleware/ltiMiddleware');
const { sendGradeToMoodle } = require('./services/ltiService');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const CrosswordGenerator = require('./classes/CrosswordGenerator');
const WordSoupGenerator = require('./classes/WordSoupGenerator');
const FileManager = require('./classes/FileManager');

const app = express();
const publicPath = path.join(__dirname, 'public');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL;

// Инициализация LTI
const { validateLTIRequest } = initializeLTI();

// Инициализация админского клиента Supabase (только на бэкенде!)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const crosswordGenerator = new CrosswordGenerator(OPENROUTER_API_KEY, OPENROUTER_API_URL);
const wordSoupGenerator = new WordSoupGenerator(OPENROUTER_API_KEY, OPENROUTER_API_URL);
const fileManager = new FileManager();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS configuration
const allowedOrigin = process.env.ALLOWED_ORIGINS 
app.use(cors({
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true
}));

const { generateGamePdf } = require('./services/pdfGeneratorService');

// Configure middleware
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1); 

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        sameSite: 'none',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.post('/api/generate-game', upload.single('file-upload'), async (req, res) => {
    try {
        const inputType = req.body.inputType;
        const gameType = req.body.gameType;
        const totalWords = parseInt(req.body.totalWords);
        const difficulty = req.body.difficulty || 'normal';
        let text = '';
        
        // Handle different input types
        if (inputType === 'text') {
            text = req.body.text;
        } else if (inputType === 'topic') {
            text = req.body.topic;
        } else if (inputType === 'file' && req.file) {
            // Validate and parse file
            fileManager.validateFileType(req.file.originalname);
            fileManager.validateFileSize(req.file);
            text = await fileManager.parseFile(req.file);
        } else {
            throw new Error('Invalid input type or missing file');
        }

        // Input validation
        if (!text || text.trim().length === 0) {
            throw new Error('Empty input text');
        }

        if (isNaN(totalWords) || totalWords < 1) {
            throw new Error('Invalid number of words');
        }
        
        // Generate game based on type
        let gameData;
        if (gameType === 'wordsoup') {
            gameData = await wordSoupGenerator.generateWordSoup(text, inputType, totalWords, difficulty);
            if (!gameData || !gameData.grid || !gameData.words) {
                throw new Error('Failed to generate valid word soup data');
            }
        } else {
            const crosswordData = await crosswordGenerator.generateCrossword(text, inputType, totalWords, difficulty);
            if (!crosswordData || !crosswordData.crossword || !crosswordData.words || !crosswordData.layout) {
                throw new Error('Failed to generate valid crossword data');
            }
            gameData = {
                grid: crosswordData.crossword,
                words: crosswordData.words,
                layout: crosswordData.layout,
                crossword: crosswordData.crossword // сохраняем для обратной совместимости
            };
        }

        res.json(gameData);

    } catch (error) {
        console.error('Error generating game:', error);
        
        // Send appropriate error response
        let statusCode = 500;
        let errorMessage = 'An error occurred while generating the game';

        if (error.message.includes('Invalid input') || error.message.includes('Empty input')) {
            statusCode = 400;
            errorMessage = error.message;
        } else if (error.message.includes('API') || error.message.includes('нейросеть')) {
            statusCode = 503;
            errorMessage = 'AI service temporarily unavailable. Please try again later.';
        }

        res.status(statusCode).json({ 
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.post('/api/lti/submit-score', express.json(), async (req, res) => {
    console.log('Received request to submit score:', req.body);

    if (!req.session || !req.session.lti) {
        console.warn('Submit score attempt without active LTI session.');
        return res.status(403).json({ error: 'Forbidden: No active LTI session.' });
    }
    const { lis_outcome_service_url, lis_result_sourcedid } = req.session;
    if (!lis_outcome_service_url || !lis_result_sourcedid) {
        console.error('Missing LTI outcome URL or sourcedId in session.');
        return res.status(400).json({ error: 'Bad Request: Missing necessary LTI parameters in session for grade submission.' });
    }

    const { score, totalScore } = req.body;
    if (score === undefined || score === null || totalScore === undefined || totalScore === null || isNaN(score) || isNaN(totalScore)) {
        console.error('Invalid score or totalScore received:', req.body);
        return res.status(400).json({ error: 'Bad Request: Invalid or missing score/totalScore.' });
    }

    const consumerKey = process.env.LTI_KEY;
    const consumerSecret = process.env.LTI_SECRET;
    if (!consumerKey || !consumerSecret) {
        console.error('LTI_KEY or LTI_SECRET is not configured on the server.');
        return res.status(500).json({ error: 'Internal Server Error: LTI credentials not configured.' });
    }

    const sourcedIdToSend = lis_result_sourcedid;
    console.log(`Using sourcedId directly from session: ${sourcedIdToSend}`);

    try {
        const success = await sendGradeToMoodle(
            lis_outcome_service_url,
            sourcedIdToSend,
            parseFloat(score),
            parseFloat(totalScore),
            consumerKey,
            consumerSecret
        );

        if (success) {
            res.status(200).json({ message: 'Score submitted successfully to Moodle.' });
        } else {
            res.status(500).json({ error: 'Failed to submit score to Moodle for an unknown reason.' });
        }
    } catch (error) {
        console.error('Error occurred during grade submission process:', error);
        res.status(500).json({
            error: 'Failed to submit score to Moodle.',
            details: error.message || 'Unknown error'
        });
    }
});

app.post('/api/track-activity', express.json(), async (req, res) => {
    console.log('Received tracking data:', req.body);
    console.log('Tracking data successfully processed (simulated save).');
    res.status(200).json({ message: 'Activity tracked successfully' });
});

app.post('/lti/launch', validateLTIRequest, async (req, res) => {
    try {
        // 1. Получаем данные пользователя из сессии
        const moodleUserId = req.session.userId;
        const moodleUserEmail = req.session.lis_person_contact_email_primary;
        const moodleFullName = req.session.lis_person_name_full;
        const rolesString = req.session.roles || '';

        if (!moodleUserId || !moodleUserEmail) {
            throw new Error("LTI request is missing user_id or email.");
        }

        // 2. Ищем пользователя в Supabase по его Moodle ID
        const { data: existingUser, error: findError } = await supabaseAdmin.auth.admin.listUsers();
        
        let user = existingUser.users.find(u => u.user_metadata.moodle_id === moodleUserId);

        // 3. Если пользователь не найден - создаем его (Just-in-Time Provisioning)
        if (!user) {
            console.log(`User with Moodle ID ${moodleUserId} not found. Creating new user...`);
            const { data: newUserObject, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: moodleUserEmail,
                email_confirm: true,
                user_metadata: {
                    full_name: moodleFullName,
                    moodle_id: moodleUserId,
                    roles: rolesString,
                    source: 'lti_moodle'
                }
            });

            if (createError) {
                if (createError.message.includes('duplicate key value')) {
                     throw new Error(`User with email ${moodleUserEmail} already exists but is not linked to this Moodle account. Please contact support.`);
                }
                throw createError;
            }
            user = newUserObject.user;
            console.log(`Created new user with Supabase ID: ${user.id}`);
        } else {
            console.log(`Found existing user. Supabase ID: ${user.id}`);
        }

        // 4. Теперь у нас есть `user.id` - это UUID из Supabase. Используем его для JWT.
        const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
        if (!supabaseJwtSecret) {
            throw new Error("SUPABASE_JWT_SECRET is not set on the server.");
        }

        const payload = {
            sub: user.id,
            aud: 'authenticated',
        };
        
        const supabaseToken = jwt.sign(payload, supabaseJwtSecret, { expiresIn: '1h' });

        // 5. Формируем URL для редиректа на фронтенд
        const clientUrl = new URL(process.env.CLIENT_URL);
        clientUrl.pathname = '/gamegenerator';
        
        clientUrl.searchParams.append('supabase_token', supabaseToken);
        clientUrl.searchParams.append('lti', 'true');
        clientUrl.searchParams.append('resource_link_id', req.session.resource_link_id);

        const rolesLowerCase = rolesString.toLowerCase();
        if (rolesLowerCase.includes('instructor') || rolesLowerCase.includes('teacher') || rolesLowerCase.includes('administrator')) {
            clientUrl.searchParams.append('mode', 'configure');
        } else {
            clientUrl.searchParams.append('mode', 'solve');
        }

        console.log(`Redirecting to: ${clientUrl.toString()}`);
        res.redirect(clientUrl.toString());

    } catch (error) {
        console.error("FATAL Error during LTI launch:", error);
        res.status(500).send(`Internal Server Error: ${error.message}`);
    }
});

// Функция для экранирования имени файла
function sanitizeFilename(filename) {
    // Заменяем недопустимые символы и кириллицу на безопасные
    return encodeURIComponent(filename)
        .replace(/[^a-zA-Z0-9-_.]/g, '_') // Заменяем всё, кроме букв, цифр, -_. на подчёркивание
        .replace(/%20/g, '_'); // Пробелы на подчёркивание
}

app.post('/api/generate-pdf', async (req, res) => {
    try {
        const { gameData, gameName } = req.body;

        if (!gameData || !gameData.gameType) {
            return res.status(400).json({ error: 'Missing or invalid gameData' });
        }

        const pdfBuffer = await generateGamePdf({ ...gameData, name: gameName });

        res.setHeader('Content-Type', 'application/pdf');
        // Используем экранированное имя файла
        const safeFilename = sanitizeFilename(gameName || gameData.gameType || 'game');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${safeFilename}.pdf"`
        );

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message });
    }
});

app.post('/api/recalculate-game-layout', express.json(), async (req, res) => {
    try {
        const { gameType, words } = req.body;

        // Валидация входных данных
        if (!gameType || !words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ error: 'Неверные входные данные: требуется gameType и непустой массив слов.' });
        }

        // Проверка структуры каждого слова
        for (const item of words) {
            if (!item || typeof item.word !== 'string' || typeof item.clue !== 'string' || item.word.trim() === '') {
                return res.status(400).json({ error: 'Неверный массив слов: каждый элемент должен содержать строки "word" и "clue".' });
            }
        }
        
        let recalculatedData;
        if (gameType === 'crossword') {
            recalculatedData = crosswordGenerator.buildCrosswordFromWords(words);
        } else if (gameType === 'wordsoup') {
            recalculatedData = wordSoupGenerator.buildSoupFromWords(words);
        } else {
            return res.status(400).json({ error: 'Неверный тип игры для перегенерации.' });
        }

        res.json(recalculatedData);

    } catch (error) {
        console.error('Ошибка при перегенерации сетки:', error);
        if (error.message.includes("Could not generate") || error.message.includes("No words provided") || error.message.includes("No valid words")) {
            return res.status(422).json({ error: error.message }); // Unprocessable Entity
        }
        res.status(500).json({ 
            error: 'Произошла ошибка при перегенерации сетки игры.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});