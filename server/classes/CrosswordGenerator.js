// Импорт необходимых модулей
const axios = require('axios');
const clg = require('crossword-layout-generator');

/**
 * Класс для генерации кроссвордов
 * Использует OpenRouter API для генерации слов и подсказок,
 * и crossword-layout-generator для создания сетки кроссворда
 */
class CrosswordGenerator {
    /**
     * Создает экземпляр генератора кроссвордов
     * @param {string} apiKey - Ключ API для OpenRouter
     * @param {string} apiUrl - URL API OpenRouter
     */
    constructor(apiKey, apiUrl) {
        this.openrouterApiKey = apiKey;
        this.openrouterApiUrl = apiUrl;
    }

    /**
     * Генерирует кроссворд на основе входного текста или темы
     * @param {string} text - Входной текст или тема
     * @param {string} inputType - Тип входных данных ('text', 'topic' или 'file')
     * @param {number} totalWords - Желаемое количество слов в кроссворде
     * @returns {Object} Объект с данными кроссворда и словами
     */
    async generateCrossword(text, inputType, totalWords) {
        try {
            // Очищаем текст, удаляя лишние пробелы и переносы строк
            text = text.trim().replace(/\s+/g, ' ');

            let prompt = '';
            if (inputType === 'topic') {
                prompt = `Generate real ${totalWords} words related to the topic "${text}". For each word, provide a concise, accurate, and unambiguous definition, question, or short description suitable for a word puzzle. Ensure the clue directly relates to the word and is in the same language as the input topic.If you are in doubt about the choice of language, then take Russian.
                Format the response as JSON:
                [
                    {"word": "word1", "clue": "clue1"},
                    {"word": "word2", "clue": "clue2"},
                    ...
                ]
                Do not add anything outside the JSON structure. Ensure valid JSON.`;
            } else { // inputType === 'text' or 'file'
                prompt = `Extract ${totalWords} keywords from the given text: "${text}". For each word, create a concise, accurate, and unambiguous definition, question, or short description. The clue must clearly relate to the meaning of the word within the provided text and be in the same language as the input text.If you are in doubt about the choice of language, then take Russian
                Format the response as JSON:
                [
                    {"word": "word1", "clue": "clue1"},
                    {"word": "word2", "clue": "clue2"},
                    ...
                ]
                Do not add anything outside the JSON structure. Ensure valid JSON.`;
            }

            const response = await axios.post(this.openrouterApiUrl, {
                model: "google/gemma-2-9b-it:free",
                messages: [{ role: "user", content: prompt }],
                top_p: 1,
                temperature: 0.2,
                frequency_penalty: 0.8,
                presence_penalty: 0.8,
                repetition_penalty: 1,
                top_k: 50
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openrouterApiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            let messageContent = response.data.choices?.[0]?.message?.content;

            if (!messageContent || messageContent.trim().length === 0) {
                throw new Error("Нейросеть не сгенерировала текст. Попробуйте изменить запрос или повторите попытку позже.");
            }

            let originalContent = messageContent.replace(/```json/g, '').trim();
            let cleanedMessageContent = originalContent;
            
            // 1. Удаление одинарных кавычек по краям
            if (cleanedMessageContent.startsWith("'") && cleanedMessageContent.endsWith("'")) {
                cleanedMessageContent = cleanedMessageContent.slice(1, -1);
                console.log("Удалены одинарные кавычки по краям.");
            }
            
            // 2. Удаление бэкслешей перед кавычками
            cleanedMessageContent = cleanedMessageContent.replace(/\\"/g, '"');
            
            // 3. Удаление лишних точек
            cleanedMessageContent = cleanedMessageContent.replace(/\.{5,}/g, '');
            
            // 4. Находим начало и конец JSON (и обрезаем лишний текст)
            const startIndex = cleanedMessageContent.indexOf('[');
            const endIndex = cleanedMessageContent.lastIndexOf(']');
            
            if (startIndex !== -1 && endIndex !== -1 && (startIndex > 0 || endIndex < cleanedMessageContent.length - 1) ) {
                cleanedMessageContent = cleanedMessageContent.substring(startIndex, endIndex + 1);
                console.log("Обрезан лишний текст до или после JSON.");
            }
            
            // 5. Удаление непечатаемых символов, \r, \n, • и множественных пробелов
            cleanedMessageContent = cleanedMessageContent
                .replace(/[\u0000-\u001F\u007F-\u009F•\r\n]+/g, "")
                .replace(/\s+/g, " ")  // Заменяем множественные пробелы на один
                .replace(/\[\s+/g, "[") // Убираем пробелы после [
                .replace(/\s+\]/g, "]") // Убираем пробелы перед ]
                .replace(/,\s+/g, ",")  // Убираем лишние пробелы после запятых
                .replace(/\s+{/g, "{")  // Убираем пробелы перед {
                .replace(/}\s+/g, "}")  // Убираем пробелы после }
                .replace(/\]\s*\]/g, "]"); // Убираем двойные ]]
            
            // 6. Удаление лишних пробелов в конце
            cleanedMessageContent = cleanedMessageContent.trim();
            
            // 7. Удаляем запятую после последнего элемента массива
            cleanedMessageContent = cleanedMessageContent.replace(/,\s*\]$/, ']');
            
            if (originalContent !== cleanedMessageContent) {
                console.log("Произведена очистка JSON. Исходный текст:", originalContent);
                console.log("Очищенный текст:", cleanedMessageContent);
            }

            console.log("Текст перед парсингом:", cleanedMessageContent);

            let wordsData;

            try {
                wordsData = JSON.parse(cleanedMessageContent);
            } catch (jsonError) {
                throw new Error("Нейросеть вернула невалидный JSON. Попробуйте повторить запрос.");
            }

            // Проверка структуры данных после парсинга
            if (!Array.isArray(wordsData) || !wordsData.every(item => typeof item === 'object' && item.hasOwnProperty('word') && item.hasOwnProperty('clue'))) {
                throw new Error('Неверная структура данных от нейросети');
            }

            // Генерация кроссворда
            const layout = clg.generateLayout(wordsData.map(item => ({
                answer: item.word.replace(/\s+/g, ''),  // Удаляем пробелы для сетки
                clue: item.clue
            })));

            // Обновляем ответы в layout без пробелов, но сохраняем оригинальные слова
            layout.result.forEach(wordData => {
                const originalWord = wordsData.find(item => 
                    item.word.replace(/\s+/g, '').toUpperCase() === wordData.answer.toUpperCase()
                )?.word;
                
                wordData.originalWord = originalWord; // Сохраняем оригинальное слово с пробелами
                wordData.word = originalWord; // Добавляем также в поле word для совместимости
                wordData.answer = wordData.answer.replace(/\s+/g, ''); // Версия без пробелов для сетки
            });

            const crosswordGrid = this.createGridFromLayout(layout, wordsData);

            // Подготавливаем слова для отображения, сохраняя оригинальные версии
            const displayWords = layout.result.map(wordData => ({
                ...wordData,
                word: wordData.originalWord, // Используем оригинальное слово для подсказок
                answer: wordData.originalWord, // Для совместимости с разными форматами
                cleanAnswer: wordData.answer // Сохраняем версию без пробелов для проверки
            }));

            return {
                crossword: crosswordGrid,
                words: displayWords,
                rawResponse: response.data,
                parsedWords: wordsData,
                layout: layout
            };

        } catch (error) {
            // Проверяем, является ли ошибка ошибкой API
            if (error.response) {
                throw new Error(`Ошибка API запроса: ${error.response.data.error || error.response.statusText}`);
            }
            // Если это наша собственная ошибка, пробрасываем её дальше
            throw error;
        }
    }

    /**
     * Создает матрицу кроссворда на основе макета
     * @param {Object} layout - Макет кроссворда
     * @param {Array} wordsData - Данные слов и подсказок
     * @returns {Array<Array<string>>} Матрица кроссворда
     */
    createGridFromLayout(layout, wordsData) {
        const grid = Array.from({ length: layout.rows }, () => Array(layout.cols).fill(''));
        layout.result.forEach((wordData, index) => {
            // Используем версию слова без пробелов для сетки
            const wordForGrid = wordData.answer.toUpperCase();
            
            if (wordForGrid && wordData.orientation !== 'none') {
                let x = wordData.startx - 1;
                let y = wordData.starty - 1;
                
                // Базовая проверка координат
                if (x < 0 || y < 0 || x >= layout.cols || y >= layout.rows) {
                    console.warn(`Пропуск слова ${wordForGrid}: некорректные начальные координаты`);
                    return;
                }

                for (let i = 0; i < wordForGrid.length; i++) {
                    let currentX = wordData.orientation === 'across' ? x + i : x;
                    let currentY = wordData.orientation === 'across' ? y : y + i;
                    
                    // Проверка выхода за границы
                    if (currentX >= layout.cols || currentY >= layout.rows) {
                        console.warn(`Пропуск слова ${wordForGrid}: выход за границы сетки`);
                        return;
                    }

                    grid[currentY][currentX] = wordForGrid[i];
                }
            }
        });
        return grid;
    }
}

module.exports = CrosswordGenerator;
