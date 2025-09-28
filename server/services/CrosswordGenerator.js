// Импорт необходимых модулей
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
     * @param {string} [difficulty='normal'] - Уровень сложности слов
     * @returns {Object} Объект с данными кроссворда и словами
     */
    async generateCrossword(text, inputType, totalWords, difficulty = 'normal') {
        try {
            // Очищаем текст, удаляя лишние пробелы и переносы строк
            text = text.trim().replace(/\s+/g, ' ');
            const difficultyLevel = difficulty === 'easy' ? 'simple and commonly used' :
                                  difficulty === 'hard' ? 'complex and sophisticated' :
                                  'moderately difficult';
            let prompt = '';
            if (inputType === 'topic') {
                prompt = `Generate real ${totalWords} ${difficultyLevel} words related to the topic "${text}" . The keywords must be in their base form (lemma). For each word, provide a concise, accurate, and unambiguous definition, question, or short description suitable for a word puzzle. Ensure the clue directly relates to the word and is in the same language as the input topic.Avoid direct clues, use paraphrases/analogies, but not direct answers.If you are in doubt about the choice of language, then take Russian.
                Format the response as JSON:
                [
                    {"word": "word1", "clue": "clue1"},
                    {"word": "word2", "clue": "clue2"},
                    ...
                ]
                Do not add anything outside the JSON structure. Ensure valid JSON.`;
            } else { // inputType === 'text' or 'file'
                prompt = `Extract ${totalWords} ${difficultyLevel} keywords from the given text: "${text}" . The keywords must be in their base form (lemma).For each word, create a concise, accurate, and unambiguous definition, question, or short description. The clue must clearly relate to the meaning of the word within the provided text and be in the same language as the input text. Avoid direct clues, use paraphrases/analogies, but not direct answers.If you are in doubt about the choice of language, then take Russian.                
                Format the response as JSON:
                [
                    {"word": "word1", "clue": "clue1"},
                    {"word": "word2", "clue": "clue2"},
                    ...
                ]
                Do not add anything outside the JSON structure. Ensure valid JSON.`;
            }

            const headers = {
                'Authorization': `Bearer ${this.openrouterApiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': '*',
                'X-Title': 'Conundrum Game Generator',
                'User-Agent': 'Conundrum/1.0.0'
            };
            const response = await fetch(this.openrouterApiUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    model: "google/gemma-3-27b-it:free", 
                    messages: [{ role: "user", content: prompt }],
                    top_p: 1,
                    temperature: 0.2,
                    frequency_penalty: 0.8,
                    presence_penalty: 0.8,
                    repetition_penalty: 1,
                    top_k: 50
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('OpenRouter API error:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
            }

            const responseData = await response.json();
            const generatedText = responseData?.choices?.[0]?.message?.content;
            
            if (!generatedText) {
                throw new Error('Нейросеть не сгенерировала текст...');
            }

            let originalContent = generatedText.replace(/```json/g, '').trim();
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

            let parsedData;

            try {
                parsedData = JSON.parse(cleanedMessageContent);
            } catch (jsonError) {
                throw new Error("Нейросеть вернула невалидный JSON. Попробуйте повторить запрос.");
            }

            const wordsData = parsedData.map(item => {
                if (typeof item !== 'object' || item === null) {
                    console.warn("Найден не объектный элемент в массиве от нейросети:", item);
                    // Возвращаем null, чтобы потом отфильтровать невалидные элементы
                    return null;
                }
                const normalizedItem = {};
                let hasWord = false;
                let hasClue = false;
                for (const key in item) {
                    // Проверяем, что это собственное свойство объекта
                    if (Object.hasOwnProperty.call(item, key)) {
                        const trimmedKey = key.trim(); // Обрезаем пробелы с ключа
                        normalizedItem[trimmedKey] = item[key]; // Присваиваем значение новому объекту
                        // Запоминаем, что нужные ключи встретились (даже если были с пробелами)
                        if (trimmedKey === 'word') hasWord = true;
                        if (trimmedKey === 'clue') hasClue = true;
                    }
                }
                 // Убеждаемся, что оба ключа ('word', 'clue') теперь есть в нормализованном объекте
                if (!hasWord || !hasClue) {
                    console.warn('Элемент не содержит "word" или "clue" после нормализации ключей:', item, '->', normalizedItem);
                    return null; // Помечаем элемент как невалидный для фильтрации
                }
                return normalizedItem;
            }).filter(item => item !== null); // Убираем невалидные (null) элементы из массива

            if (!Array.isArray(wordsData)) {
                // Эта ошибка маловероятна после .map().filter(), но оставим как защиту
                console.error("Результат после нормализации не является массивом:", wordsData);
                throw new Error('Неверная структура данных от нейросети (ошибка после нормализации)');
            }

            // Дополнительная проверка: убедимся, что массив не пустой после фильтрации
            if (wordsData.length === 0) {
                 console.error("После очистки и нормализации не осталось валидных слов.", "Исходные данные после парсинга:", parsedData);
                 throw new Error('Нейросеть не вернула валидных слов или все они были отфильтрованы.');
            }


            // Генерация кроссворда
            const layout = clg.generateLayout(wordsData.map(item => ({
                answer: item.word.replace(/\s+/g, ''),  // Удаляем пробелы для сетки
                clue: item.clue
            })));

            // Обновляем ответы в layout без пробелов, но сохраняем оригинальные слова
            layout.result.forEach(wordData => {
                const originalWordData = wordsData.find(item =>
                    item.word.replace(/\s+/g, '').toUpperCase() === wordData.answer.toUpperCase()
                );
                const originalWord = originalWordData ? originalWordData.word : wordData.answer; // Запасной вариант

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
                rawResponse: responseData,
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
                    if (grid[currentY][currentX] !== '' && grid[currentY][currentX] !== wordForGrid[i]) {
                         console.warn(`Конфликт букв в ячейке (${currentX}, ${currentY}) для слова ${wordForGrid}. Существующая: ${grid[currentY][currentX]}, Новая: ${wordForGrid[i]}`);
                    }
                    grid[currentY][currentX] = wordForGrid[i];
                }
            }
        });
        return grid;
    }

    buildCrosswordFromWords(wordsAndClues) {
        if (!wordsAndClues || !Array.isArray(wordsAndClues) || wordsAndClues.length === 0) {
            throw new Error('Не предоставлены слова для генерации кроссворда.');
        }

        // Фильтрация и нормализация слов
        const validWordsAndClues = wordsAndClues.filter(
            item => item && typeof item.word === 'string' && typeof item.clue === 'string' && item.word.trim() !== ''
        ).map(item => ({ word: item.word.trim(), clue: item.clue.trim() }));

        if (validWordsAndClues.length === 0) {
            throw new Error('Нет валидных слов для генерации кроссворда.');
        }

        // Подготовка данных для генерации сетки
        const layoutInput = validWordsAndClues.map(item => ({
            answer: item.word.replace(/\s+/g, '').toUpperCase(),
            clue: item.clue
        }));

        // Генерация макета кроссворда
        const layout = clg.generateLayout(layoutInput);

        if (!layout || !layout.result || layout.result.length === 0) {
            throw new Error("Не удалось сгенерировать валидный макет кроссворда. Возможно, слова не пересекаются или их слишком мало.");
        }

        // Сопоставление сгенерированных слов с оригинальными
        const displayWords = layout.result.map(wordData => {
            const originalItem = validWordsAndClues.find(
                item => item.word.replace(/\s+/g, '').toUpperCase() === wordData.answer.toUpperCase()
            );
            const originalWord = originalItem ? originalItem.word : wordData.answer;
            return {
                ...wordData,
                word: originalWord,
                originalWord: originalWord,
                cleanAnswer: wordData.answer
            };
        });

        // Создание сетки кроссворда
        const crosswordGrid = this.createGridFromLayout(layout);

        return {
            crossword: crosswordGrid,
            words: displayWords,
            layout: layout
        };
    }
}

module.exports = CrosswordGenerator;