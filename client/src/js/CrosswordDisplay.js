import { CluesDisplay } from './CluesDisplay.js';
import { GameStateManager } from './GameStateManager.js';
import { DisplayBase } from './DisplayBase.js';
/**
 * Класс, отвечающий за отображение и взаимодействие с кроссвордом
 */
export class CrosswordDisplay extends DisplayBase {
    static currentDirection = null; // Добавляем статическое свойство для хранения текущего направления

    /**
     * Отображает сетку кроссворда и слова
     * @param {Array<Array<string>>} grid - Двумерный массив, представляющий сетку кроссворда
     * @param {Array<Object>} words - Массив объектов слов, содержащих позицию и ориентацию
     */
    static displayCrossword(grid, words) {
        console.log("Сетка в displayCrossword:", grid);
        console.log("Слова в displayCrossword:", words);

        // Сбрасываем направление при новом отображении
        this.currentDirection = null;

        // Очищаем игровое поле
        this.clearGameField();

        // Проверяем входные данные
        if (!grid || !words) {
            console.error("Отсутствует сетка или слова!");
            GameStateManager.displayError('Не удалось получить данные кроссворда');
            return;
        }

        // Создаем таблицу
        const table = this.createElement('table', { className: 'crossword-table' });
        const crosswordContainer = document.getElementById('crossword-container');

        // Генерируем ячейки кроссворда
        grid.forEach((row, rowIndex) => {
            const tr = this.createElement('tr', {}, '', table);
            row.forEach((cell, colIndex) => {
                if (cell !== '') {
                    // Проверяем, начинается ли слово в этой позиции
                    const wordData = words.find(word =>
                        word.startx - 1 === colIndex && word.starty - 1 === rowIndex && word.orientation !== 'none'
                    );

                    // Создаем ячейку
                    const td = this.createElement('td', {
                        className: 'crossword-cell',
                        'data-correct-letter': cell.toUpperCase()
                    }, '', tr);

                    // Добавляем номер слова, если есть
                    if (wordData) {
                        this.createElement('span', 
                            { className: 'word-number' }, 
                            wordData.position, 
                            td
                        );
                    }

                    // Добавляем поле ввода
                    this.createElement('input', {
                        type: 'text',
                        maxLength: '1',
                        className: 'crossword-input'
                    }, '', td);
                } else {
                    this.createElement('td', { className: 'black-cell' }, '', tr);
                }
            });
        });

        crosswordContainer.appendChild(table);

        // Отображаем подсказки
        CluesDisplay.displayCrosswordClues(words);

        // Добавляем обработчики событий
        table.addEventListener('input', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                // Определяем направление при первом клике, если оно еще не установлено
                if (!this.currentDirection) {
                    this.currentDirection = this.determineWordDirection(event.target.parentNode, grid);
                }

                const validateInput = (input) => {
                    return input === event.target.parentNode.dataset.correctLetter;
                };

                const onValidInput = (input) => {
                    input.parentNode.style.backgroundColor = '#62E953';
                    const nextInput = this.findNextInput(input, grid);
                    if (nextInput) {
                        nextInput.focus();
                    }
                    GameStateManager.checkCrosswordSolved();
                };

                const onInvalidInput = (input) => {
                    input.parentNode.style.backgroundColor = '#ED7E98';
                };

                this.handleInput(event, validateInput, onValidInput, onInvalidInput);
            }
        });

        table.addEventListener('keydown', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                const onEnter = (input) => {
                    const nextInput = this.findNextInput(input, grid);
                    if (nextInput) {
                        nextInput.focus();
                    }
                };

                const onArrow = (input, key) => {
                    // При нажатии стрелок меняем направление
                    if (key === 'ArrowRight' || key === 'ArrowLeft') {
                        this.currentDirection = 'across';
                    } else if (key === 'ArrowUp' || key === 'ArrowDown') {
                        this.currentDirection = 'down';
                    }

                    const currentCell = input.parentNode;
                    const row = currentCell.parentNode.rowIndex;
                    const col = currentCell.cellIndex;
                    let nextInput;

                    switch (key) {
                        case 'ArrowRight':
                            if (col + 1 < grid[row].length) {
                                nextInput = currentCell.parentNode.cells[col + 1].querySelector('input');
                            }
                            break;
                        case 'ArrowLeft':
                            if (col > 0) {
                                nextInput = currentCell.parentNode.cells[col - 1].querySelector('input');
                            }
                            break;
                        case 'ArrowDown':
                            if (row + 1 < grid.length) {
                                nextInput = table.rows[row + 1].cells[col].querySelector('input');
                            }
                            break;
                        case 'ArrowUp':
                            if (row > 0) {
                                nextInput = table.rows[row - 1].cells[col].querySelector('input');
                            }
                            break;
                    }

                    if (nextInput) {
                        nextInput.focus();
                    }
                };

                this.handleKeydown(event, onEnter, onArrow);
            }
        });

        // Добавляем обработчик клика для установки направления
        table.addEventListener('click', (event) => {
            if (event.target.classList.contains('crossword-input')) {
                // Сбрасываем направление при клике на новую ячейку
                this.currentDirection = null;
            }
        });
    }

    /**
     * Находит следующую ячейку для ввода на основе текущей ячейки и сетки
     * @param {HTMLElement} currentInput - Текущая ячейка для ввода
     * @param {Array<Array<string>>} grid - Сетка кроссворда
     * @returns {HTMLElement|null} Следующая ячейка для ввода или null, если не найдена
     */
    static findNextInput(currentInput, grid) {
        const currentCell = currentInput.parentNode;
        const row = currentCell.parentNode.rowIndex;
        const col = currentCell.cellIndex;

        // Используем сохраненное направление, если оно есть
        const direction = this.currentDirection || this.determineWordDirection(currentCell, grid);
        
        if (direction === 'down') {
            // Если слово идет вниз, проверяем ячейку снизу
            if (row + 1 < grid.length && grid[row + 1][col] !== '') {
                const nextRow = currentCell.parentNode.parentNode.rows[row + 1];
                const nextCell = nextRow.cells[col];
                const nextInput = nextCell.querySelector('input');
                if (nextInput) return nextInput;
            }
        } else {
            // Если слово идет вправо, проверяем ячейку справа
            if (col + 1 < grid[row].length && grid[row][col + 1] !== '') {
                const nextCell = currentCell.parentNode.cells[col + 1];
                const nextInput = nextCell.querySelector('input');
                if (nextInput) return nextInput;
            }
        }

        return null;
    }

    /**
     * Определяет направление слова на основе текущей ячейки
     * @param {HTMLElement} cell - Текущая ячейка
     * @param {Array<Array<string>>} grid - Сетка кроссворда
     * @returns {string} 'across' для горизонтального направления, 'down' для вертикального
     */
    static determineWordDirection(cell, grid) {
        const row = cell.parentNode.rowIndex;
        const col = cell.cellIndex;
        
        // Проверяем, является ли текущая ячейка началом слова
        const wordNumber = cell.querySelector('.word-number');
        if (wordNumber) {
            // Проверяем направление слова, начинающегося в этой ячейке
            const hasRight = col + 1 < grid[row].length && grid[row][col + 1] !== '';
            const hasDown = row + 1 < grid.length && grid[row + 1][col] !== '';
            
            if (hasDown && !hasRight) return 'down';
            if (hasRight && !hasDown) return 'across';
        }
        
        // Если это не начало слова, определяем направление по соседним ячейкам
        const hasLeft = col > 0 && grid[row][col - 1] !== '';
        const hasRight = col + 1 < grid[row].length && grid[row][col + 1] !== '';
        const hasUp = row > 0 && grid[row - 1][col] !== '';
        const hasDown = row + 1 < grid.length && grid[row + 1][col] !== '';

        // Если есть соседи слева или справа, значит слово горизонтальное
        if (hasLeft || hasRight) return 'across';
        // Если есть соседи сверху или снизу, значит слово вертикальное
        if (hasUp || hasDown) return 'down';

        return 'across'; // По умолчанию горизонтальное направление
    }
}