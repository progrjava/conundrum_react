require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const session = require('express-session');
const { initializeLTI } = require('./middleware/ltiMiddleware');
const { sendGradeToMoodle } = require('./services/ltiService');

const CrosswordGenerator = require('./classes/CrosswordGenerator');
const WordSoupGenerator = require('./classes/WordSoupGenerator');
const FileManager = require('./classes/FileManager');

const app = express();
const publicPath = path.join(__dirname, 'public');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL;

// Инициализация LTI
const { validateLTIRequest } = initializeLTI();

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
    saveUninitialized: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        httpOnly: true
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

    // Получаем ПОЛНЫЙ sourcedId из сессии
    const rawSourcedId = lis_result_sourcedid;

    // ПАРСИМ JSON и извлекаем ТОЛЬКО HASH
    let sourcedIdToSend;
    try {
        const parsedSourcedId = JSON.parse(rawSourcedId);
        sourcedIdToSend = parsedSourcedId.hash; // Берем только значение поля hash
        if (!sourcedIdToSend) {
            throw new Error("Required 'hash' property not found in parsed sourcedId JSON.");
        }
        console.log(`Extracted hash from sourcedId: ${sourcedIdToSend}`);
    } catch (parseError) {
        console.error(`Failed to parse lis_result_sourcedid JSON or find hash: ${rawSourcedId}`, parseError);
        return res.status(500).json({ error: 'Internal Server Error: Could not process sourcedId from session.' });
    }

    try {
        const success = await sendGradeToMoodle(
            lis_outcome_service_url,
            sourcedIdToSend, // Используем извлеченный hash
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

// Маршруты
app.post('/lti/launch', validateLTIRequest, (req, res) => {
    // Получаем userId из сессии (установлен middleware)
    const ltiUserId = req.session.userId;
    // Получаем contextId из тела запроса (стандартное поле LTI)
    const ltiContextId = req.body.context_id;
    const clientUrl = process.env.CLIENT_URL;

    // Проверяем наличие необходимых данных
    if (!ltiUserId || !ltiContextId || !clientUrl) {
        console.error('LTI Launch Error: Missing userId (from session), contextId (from body), or CLIENT_URL');
        // Убедись, что Moodle точно отправляет context_id
        console.log('LTI Request Body:', req.body);
        return res.status(400).send('LTI launch configuration error: Missing required parameters.');
    }

    // Формируем URL для редиректа на клиент с ПРАВИЛЬНЫМИ именами параметров
    try {
        const redirectUrl = new URL(clientUrl);
        redirectUrl.pathname = '/game-generator'; 

        redirectUrl.searchParams.append('lti', 'true');
        redirectUrl.searchParams.append('user_id', ltiUserId); 
        redirectUrl.searchParams.append('context_id', ltiContextId);

        console.log(`LTI Launch (after validation): Redirecting user ${ltiUserId} from context ${ltiContextId} to ${redirectUrl.toString()}`);

        // Выполняем редирект
        res.redirect(redirectUrl.toString());

    } catch (error) {
        console.error("Error creating redirect URL:", error);
        console.error("Client URL from .env:", clientUrl);
        return res.status(500).send('Internal Server Error: Failed to create redirect URL.');
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


// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});