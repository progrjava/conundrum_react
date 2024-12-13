const CrosswordGenerator = require('./CrosswordGenerator');

/**
 * Генератор супа из слов на основе логики кроссворда
 */
class WordSoupGenerator extends CrosswordGenerator {
    constructor(apiKey, apiUrl) {
        super(apiKey, apiUrl);
        this.orientations = ['horizontal', 'vertical', 'diagonal'];
    }

    /**
     * Генерирует суп из слов
     * @override
     */
    async generateWordSoup(text, inputType, totalWords) {
        try {
            // Используем метод родительского класса для получения слов через AI
            const wordsData = await this.extractWordsFromAI(text, inputType, totalWords);

            // Определяем размер сетки на основе самого длинного слова (без пробелов)
            const longestWordLength = Math.max(...wordsData.map(w => w.word.replace(/\s+/g, '').length));
            const gridSize = Math.max(20, longestWordLength + 5); // Минимум 20x20 или длина самого длинного слова + 5

            // Создаем сетку нужного размера
            const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(''));
            const placedWords = [];
            let position = 1;

            // Сортируем слова по длине (длинные первыми, учитывая длину без пробелов)
            const sortedWords = [...wordsData].sort((a, b) => 
                b.word.replace(/\s+/g, '').length - a.word.replace(/\s+/g, '').length
            );

            for (const wordData of sortedWords) {
                const placed = this.placeWordInSoup(grid, wordData.word);
                if (placed) {
                    placedWords.push({
                        ...wordData,
                        ...placed,
                        position: position++
                    });
                }
            }

            // Заполняем пустые клетки случайными буквами
            this.fillEmptyCells(grid);

            return {
                grid: grid,
                words: placedWords,
                gridSize: gridSize
            };

        } catch (error) {
            console.error('Error in generateWordSoup:', error);
            throw error;
        }
    }

    /**
     * Размещает слово в супе из слов
     * @private
     */
    placeWordInSoup(grid, word) {
        // Удаляем пробелы из слова
        const cleanWord = word.replace(/\s+/g, '');
        const maxAttempts = 100;
        let attempts = 0;

        while (attempts < maxAttempts) {
            const orientation = this.orientations[Math.floor(Math.random() * this.orientations.length)];
            const position = this.getRandomPosition(grid.length, cleanWord.length, orientation);

            if (this.canPlaceWord(grid, cleanWord, position.x, position.y, orientation)) {
                this.placeWordOnGrid(grid, cleanWord, position.x, position.y, orientation);
                return {
                    startx: position.x + 1,
                    starty: position.y + 1,
                    orientation: orientation
                };
            }

            attempts++;
        }

        return null;
    }

    /**
     * Получает случайную позицию для слова
     * @private
     */
    getRandomPosition(gridSize, wordLength, orientation) {
        let x, y;

        switch (orientation) {
            case 'horizontal':
                x = Math.floor(Math.random() * (gridSize - wordLength));
                y = Math.floor(Math.random() * gridSize);
                break;
            case 'vertical':
                x = Math.floor(Math.random() * gridSize);
                y = Math.floor(Math.random() * (gridSize - wordLength));
                break;
            case 'diagonal':
                x = Math.floor(Math.random() * (gridSize - wordLength));
                y = Math.floor(Math.random() * (gridSize - wordLength));
                break;
        }

        return { x, y };
    }

    /**
     * Проверяет, можно ли разместить слово
     * @private
     */
    canPlaceWord(grid, word, startX, startY, orientation) {
        const gridSize = grid.length;
        const wordLength = word.length;

        // Проверяем, не выходит ли слово за границы
        if (orientation === 'horizontal' && startX + wordLength > gridSize) return false;
        if (orientation === 'vertical' && startY + wordLength > gridSize) return false;
        if (orientation === 'diagonal' && (startX + wordLength > gridSize || startY + wordLength > gridSize)) return false;

        // Проверяем каждую букву
        for (let i = 0; i < wordLength; i++) {
            let x = startX;
            let y = startY;

            if (orientation === 'horizontal') x += i;
            if (orientation === 'vertical') y += i;
            if (orientation === 'diagonal') {
                x += i;
                y += i;
            }

            // Если клетка не пустая и содержит другую букву
            if (grid[y][x] !== '' && grid[y][x] !== word[i]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Размещает слово на сетке
     * @private
     */
    placeWordOnGrid(grid, word, startX, startY, orientation) {
        for (let i = 0; i < word.length; i++) {
            let x = startX;
            let y = startY;

            if (orientation === 'horizontal') x += i;
            if (orientation === 'vertical') y += i;
            if (orientation === 'diagonal') {
                x += i;
                y += i;
            }

            grid[y][x] = word[i].toUpperCase();
        }
    }

    /**
     * Заполняет пустые клетки случайными буквами
     * @private
     */
    fillEmptyCells(grid) {
        const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
        
        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === '') {
                    grid[y][x] = letters[Math.floor(Math.random() * letters.length)];
                }
            }
        }
    }

    /**
     * Извлекает слова из текста через AI
     * @private
     */
    async extractWordsFromAI(text, inputType, totalWords) {
        // Используем родительский метод для работы с AI
        const response = await super.generateCrossword(text, inputType, totalWords);
        return response.words;
    }
}

module.exports = WordSoupGenerator;
