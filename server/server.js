const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const CrosswordGenerator = require('./classes/CrosswordGenerator');
const WordSoupGenerator = require('./classes/WordSoupGenerator');
const FileManager = require('./classes/FileManager');

const app = express();
const publicPath = path.join(__dirname, 'public');

const openrouterApiKey = "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";
const openrouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';

// Initialize our classes
const crosswordGenerator = new CrosswordGenerator(openrouterApiKey, openrouterApiUrl);
const wordSoupGenerator = new WordSoupGenerator(openrouterApiKey, openrouterApiUrl);
const fileManager = new FileManager();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static(publicPath));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth', authRoutes);

app.post('/generate-game', upload.single('file-upload'), async (req, res) => {
    try {
        const inputType = req.body.inputType;
        const gameType = req.body.gameType;
        const totalWords = parseInt(req.body.totalWords);
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
            gameData = await wordSoupGenerator.generateWordSoup(text, inputType, totalWords);
            if (!gameData || !gameData.grid || !gameData.words) {
                throw new Error('Failed to generate valid word soup data');
            }
        } else {
            const crosswordData = await crosswordGenerator.generateCrossword(text, inputType, totalWords);
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


app.use(express.static(path.join(__dirname, '../client/public')));

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});