const CrosswordGenerator = require('../services/CrosswordGenerator');
const WordSoupGenerator = require('../services/WordSoupGenerator');
const RebusGenerator = require('../services/RebusGenerator'); // <--- ДОБАВИЛИ ИМПОРТ
const FileManager = require('../services/FileManager');
const CircuitBreaker = require('../utils/CircuitBreaker');
const RateLimiter = require('../utils/RateLimiter');

const breaker = new CircuitBreaker();
const limiter = new RateLimiter(20,60000);
const crosswordGenerator = new CrosswordGenerator(process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_URL);
const wordSoupGenerator = new WordSoupGenerator(process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_URL);
const rebusGenerator = new RebusGenerator(process.env.OPENROUTER_API_KEY, process.env.OPENROUTER_API_URL); // <--- ИНИЦИАЛИЗАЦИЯ
const fileManager = new FileManager();

// Логика генерации игры с нуля
exports.generateGame = async (req, res) => {
    if (!limiter.tryConsume()) {
        return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
    }
    try {
        const gameData = await breaker.call(async () => {
            const { inputType, gameType, difficulty } = req.body;
            const totalWords = parseInt(req.body.totalWords);
            let text = '';
            
            if (inputType === 'text') text = req.body.text;
            else if (inputType === 'topic') text = req.body.topic;
            else if (inputType === 'file' && req.file) {
                text = await fileManager.parseFile(req.file);
            } else throw new Error('Invalid input type');

            if (!text?.trim()) throw new Error('Empty input text');
            
            // Заменили внутреннее имя на result
            let result; 
            if (gameType === 'wordsoup') {
                result = await wordSoupGenerator.generateWordSoup(text, inputType, totalWords, difficulty || 'normal');
            } else if (gameType === 'rebus') {
                result = await rebusGenerator.generateRebus(text, inputType, totalWords, difficulty || 'normal');
                result.gameType = 'rebus';
            } else {
                const cwData = await crosswordGenerator.generateCrossword(text, inputType, totalWords, difficulty || 'normal');
                result = { grid: cwData.crossword, words: cwData.words, layout: cwData.layout, crossword: cwData.crossword, gameType: 'crossword' };
            }
            return result; // Возвращаем результат во внешнюю константу gameData
        });
        res.json(gameData);

    } catch (error) {
        console.error('Gen Error:', error.message);
        
        let statusCode = 500;
        let userMessage = 'An error occurred while generating the game.';
        const errorMessage = error.message.toLowerCase();

        // Ошибки пользователя (400)
        if (errorMessage.includes('invalid') || errorMessage.includes('empty') || errorMessage.includes('words count') || errorMessage.includes('file')) {
            statusCode = 400;
            userMessage = error.message;
        } else if (errorMessage.includes('api') || errorMessage.includes('нейросеть') || errorMessage.includes('openrouter')) {
            statusCode = 503;
            userMessage = 'AI service is temporarily unavailable. Please try again.';
        }

        res.status(statusCode).json({ 
            error: userMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Логика пересчета сетки (когда юзер редактирует слова)
exports.recalculateLayout = async (req, res) => {
    try {
        const { gameType, words } = req.body;

        if (!gameType || !words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ error: 'Invalid data for recalculation' });
        }
        
        let recalculatedData;
        if (gameType === 'crossword') {
            recalculatedData = crosswordGenerator.buildCrosswordFromWords(words);
        } else if (gameType === 'wordsoup') {
            recalculatedData = wordSoupGenerator.buildSoupFromWords(words);
        } else {
            return res.status(400).json({ error: 'Invalid game type' });
        }

        res.json(recalculatedData);
    } catch (error) {
        console.error('Recalc Error:', error.message);
        const status = error.message.includes("Could not generate") ? 422 : 500;
        res.status(status).json({ error: error.message || 'Recalculation failed' });
    }
};