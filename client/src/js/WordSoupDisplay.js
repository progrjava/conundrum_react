import { DisplayBase } from './DisplayBase.js';
import { elements } from './elements.js';
import { CluesDisplay } from './CluesDisplay.js';

export class WordSoupDisplay extends DisplayBase {
    constructor(gameData, handleAttemptCallback, handleGameCompleteCallback) {
        super();
        this.gameData = gameData;
        this.selectedCells = [];
        this.isSelecting = false;
        this.foundWords = new Set();
        this.currentDirection = null;
        this.handleAttemptCallback = handleAttemptCallback;
        this.handleGameCompleteCallback = handleGameCompleteCallback;
        this.setupEventListeners();
    }

    /**
     * Отображает игровое поле с супом из слов
     */
    display() {
        DisplayBase.clearGameField();
        this.createGrid();
        this.displayClues();
    }

    /**
     * Отображает подсказки
     */
    displayClues() {
        CluesDisplay.displayWordSoupClues(this.gameData.words);
    }

    /**
     * Создает сетку игры
     */
    createGrid() {
        const container = DisplayBase.createElement('div', { className: 'word-soup-container' });
        const table = DisplayBase.createElement('table', { className: 'word-soup-grid' });
        
        // Вычисляем размер ячейки на основе размера сетки
        const gridSize = this.gameData.gridSize || 20;
        const cellSize = Math.max(30, Math.min(40, Math.floor(window.innerWidth * 0.8 / gridSize))); // Адаптивный размер
        
        this.gameData.grid.forEach((row, rowIndex) => {
            const tr = DisplayBase.createElement('tr', {}, '', table);
            
            row.forEach((cell, colIndex) => {
                const td = DisplayBase.createElement('td', {
                    className: 'word-soup-cell',
                    'data-row': rowIndex,
                    'data-col': colIndex,
                    'data-letter': cell,
                }, cell, tr);

                td.addEventListener('mousedown', () => this.startSelection(td));



                td.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.startSelection(td);
                });



                td.addEventListener('mouseover', () => this.continueSelection(td));


                td.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    const element = document.elementFromPoint(touch.clientX, touch.clientY);
                    if(element && element.classList.contains('word-soup-cell')) {
                        this.continueSelection(element);
                    }
                });


                td.addEventListener('mouseup', () => this.endSelection());

                td.addEventListener('touchend', () => this.endSelection());
            });
        });

        
        container.appendChild(table);
        elements.crosswordContainer.appendChild(container);
    }
        

    /**
     * Начинает выделение слова
     */
    startSelection(cell) {
        this.isSelecting = true;
        this.selectedCells = [cell];
        this.currentDirection = null; // Сбрасываем направление
        cell.classList.add('selected');


        // Блокируем скролл при начале выделения
        document.body.style.overflow = 'hidden';
    }

    /**
     * Продолжает выделение слова
     */
    continueSelection(cell) {
        if (!this.isSelecting) return;

        // Если ячейка уже выбрана, проверяем, не возвращается ли пользователь назад
        const cellIndex = this.selectedCells.indexOf(cell);
        if (cellIndex !== -1) {
            // Если это не последняя ячейка, значит пользователь вернулся назад
            // Удаляем все ячейки после текущей
            if (cellIndex < this.selectedCells.length - 1) {
                const removedCells = this.selectedCells.splice(cellIndex + 1);
                removedCells.forEach(removedCell => {
                    removedCell.classList.remove('selected');
                });
                // Если это первая ячейка, сбрасываем направление
                if (this.selectedCells.length === 1) {
                    this.currentDirection = null;
                }
            }
            return;
        }

        const lastCell = this.selectedCells[this.selectedCells.length - 1];
        const isAdjacent = this.isAdjacentCell(lastCell, cell);

        if (isAdjacent) {
            this.selectedCells.push(cell);
            cell.classList.add('selected');
        }
    }

    /**
     * Заканчивает выделение и проверяет слово
     */
    endSelection() {
        if (!this.isSelecting || this.selectedCells.length === 0) {
            this.isSelecting = false;
            return;
        }

        const selectedWord = this.getSelectedWord();
        const reversedWord = selectedWord.split('').reverse().join('');
        
        const foundWord = this.gameData.words.find(w => {
            const cleanWord = w.word.toUpperCase().replace(/\s+/g, '');
            return cleanWord === selectedWord || cleanWord === reversedWord;
        });

        let isCorrectAttempt = false;

        if (foundWord && !this.foundWords.has(foundWord.word)) {
            isCorrectAttempt = true;
            this.foundWords.add(foundWord.word);
            
            this.selectedCells.forEach(cell => {
                cell.classList.remove('selected', 'incorrect');
                cell.classList.add('found');
            });

            const wordElement = document.querySelector(`[data-word="${foundWord.word}"]`);
            if (wordElement) {
                wordElement.classList.add('found');
            }

            if (this.foundWords.size === this.gameData.words.length) {
                this.handleGameCompleteCallback();
                setTimeout(() => this.showVictoryMessage(), 100);
            }
        } else {
            isCorrectAttempt = false;
            this.selectedCells.forEach(cell => {
                if (!cell.classList.contains('found')) {
                    cell.classList.remove('selected');
                    cell.classList.add('incorrect');
                    
                    setTimeout(() => {
                        cell.classList.remove('incorrect');
                    }, 500);
                }
            });
        }



        // Восстанавливаем скролл после завершения выделения
        document.body.style.overflow = '';

        this.handleAttemptCallback(isCorrectAttempt);


        this.selectedCells = [];
        this.isSelecting = false;
        this.currentDirection = null;
    }

    /**
     * Получает выбранное слово из выделенных ячеек
     */
    getSelectedWord() {
        return this.selectedCells
            .map(cell => cell.getAttribute('data-letter'))
            .join('')
            .toUpperCase(); // Приводим к верхнему регистру для сравнения
    }

    /**
     * Проверяет, являются ли ячейки соседними и соответствуют ли направлению
     */
    isAdjacentCell(cell1, cell2) {
        const row1 = parseInt(cell1.getAttribute('data-row'));
        const col1 = parseInt(cell1.getAttribute('data-col'));
        const row2 = parseInt(cell2.getAttribute('data-row'));
        const col2 = parseInt(cell2.getAttribute('data-col'));

        // Если это вторая ячейка в выделении, устанавливаем направление
        if (this.selectedCells.length === 1) {
            this.currentDirection = this.getDirection(row1, col1, row2, col2);
        }

        // Если направление уже установлено, проверяем соответствие
        if (this.selectedCells.length > 1) {
            const isInDirection = this.isInCurrentDirection(row1, col1, row2, col2);
            if (!isInDirection) return false;
        }

        return true;
    }

    /**
     * Определяет направление между двумя ячейками
     */
    getDirection(row1, col1, row2, col2) {
        const rowDiff = row2 - row1;
        const colDiff = col2 - col1;

        // Горизонтальное направление
        if (rowDiff === 0 && Math.abs(colDiff) === 1) {
            return { rowStep: 0, colStep: Math.sign(colDiff) };
        }
        // Вертикальное направление
        else if (colDiff === 0 && Math.abs(rowDiff) === 1) {
            return { rowStep: Math.sign(rowDiff), colStep: 0 };
        }
        // Диагональное направление (вправо-вниз или влево-вниз)
        else if (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) {
            return { rowStep: Math.sign(rowDiff), colStep: Math.sign(colDiff) };
        }

        return null;
    }

    /**
     * Проверяет, соответствует ли новая ячейка текущему направлению
     */
    isInCurrentDirection(row1, col1, row2, col2) {
        if (!this.currentDirection) return false;

        const expectedRow = row1 + this.currentDirection.rowStep;
        const expectedCol = col1 + this.currentDirection.colStep;

        return row2 === expectedRow && col2 === expectedCol;
    }

    /**
     * Показывает сообщение о победе
     */
    showVictoryMessage() {

        DisplayBase.clearGameField();
        document.getElementById('clues-container').style.padding = '0px';
        const successMessage = DisplayBase.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.innerHTML = `
            <h2>Поздравляем!</h2>
            <p>Вы нашли все слова!</p>
        `;

        elements.crosswordContainer.appendChild(successMessage);
    }

    /**
     * Показывает ответ для конкретного слова
     */
    showAnswer(word) {
        // Находим все ячейки, содержащие буквы этого слова
        const cells = Array.from(document.querySelectorAll('.grid-cell'))
            .filter(cell => {
                const row = parseInt(cell.getAttribute('data-row'));
                const col = parseInt(cell.getAttribute('data-col'));
                return this.gameData.grid[row][col].words.includes(word);
            });

        // Подсвечиваем ячейки
        cells.forEach(cell => {
            cell.classList.add('highlighted');
        });

        // Убираем подсветку через 2 секунды
        setTimeout(() => {
            cells.forEach(cell => {
                cell.classList.remove('highlighted');
            });
        }, 2000);

        // Обновляем элемент в списке слов
        const wordItem = document.querySelector(`[data-word="${word}"]`);
        if (wordItem) {
            const button = wordItem.querySelector('.show-answer-button');
            if (button) {
                button.remove();
            }
        }
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Обработка перемещения за пределы сетки
        document.addEventListener('touchmove', (e) => {
            if(this.isSelecting) {
                const touch = e.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                if(element && element.classList.contains('word-soup-cell')) {
                    this.continueSelection(element);
                }
            }
        }, { passive: false });





        // Отключаем выделение при выходе за пределы сетки
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
}
