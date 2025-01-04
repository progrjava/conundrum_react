const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const CrosswordGenerator = require('./classes/CrosswordGenerator');
const WordSoupGenerator = require('./classes/WordSoupGenerator');
const FileManager = require('./classes/FileManager');

const app = express();
const publicPath = path.join(__dirname, 'public');

// Hardcoded configuration
const config = {
    supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
    supabaseKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    openrouterApiUrl: process.env.OPENROUTER_API_URL
};

// Initialize our classes
const crosswordGenerator = new CrosswordGenerator(config.openrouterApiKey, config.openrouterApiUrl);
const wordSoupGenerator = new WordSoupGenerator(config.openrouterApiKey, config.openrouterApiUrl);
const fileManager = new FileManager();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST'],
    credentials: true
}));

// Configure middleware
app.use(express.static(publicPath));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Game generation endpoint
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

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});