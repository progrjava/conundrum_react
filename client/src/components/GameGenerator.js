import React, { useState, useEffect, createRef, Component } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { Navigate } from 'react-router-dom';
import ThemeChanger from './ThemeChanger';
import axios from 'axios';
import '../css/game.css';

/**
 * Класс, отвечающий за отображение и управление подсказками кроссворда и филворда
 */
class CluesDisplay {
    /**
     * Отображает подсказки для кроссворда
     * @param {Array<Object>} words - Массив объектов слов, содержащих позицию и ориентацию
     */
    static displayCrosswordClues(words) {
        const cluesContainer = document.getElementById('clues-container');
        cluesContainer.innerHTML = '';
  
        const acrossClues = words.filter(wordData => wordData.orientation === 'across')
            .sort((a, b) => a.position - b.position);
        const downClues = words.filter(wordData => wordData.orientation === 'down')
            .sort((a, b) => a.position - b.position);
  
        const acrossContainer = this.createClueList(acrossClues, 'По горизонтали');
        const downContainer = this.createClueList(downClues, 'По вертикали');
  
        cluesContainer.appendChild(acrossContainer);
        cluesContainer.appendChild(downContainer);
    }
  
    /**
     * Отображает подсказки для филворда
     * @param {Array<Object>} words - Массив объектов слов
     */
    static displayWordSoupClues(words) {
        const cluesContainer = document.getElementById('clues-container');
        cluesContainer.innerHTML = '';
  
        // Преобразуем слова в формат для отображения
        const cluesData = words.map((word, index) => ({
            position: index + 1,
            clue: word.clue,
            word: word.word,
            cleanWord: word.word.replace(/\s+/g, '')
        }));
  
        const container = this.createClueList(cluesData, 'Слова в филворде');
        cluesContainer.appendChild(container);
    }
  
    /**
     * Создает список подсказок
     * @private
     */
    static createClueList(clues, title) {
        const list = document.createElement('ul');
        list.className = 'word-list';
  
        clues.forEach(wordData => {
            const li = document.createElement('li');
            li.className = 'word-item';
            if (wordData.cleanWord) {
                li.setAttribute('data-word', wordData.word);
                li.setAttribute('data-clean-word', wordData.cleanWord);
            }
            
            const clueText = document.createElement('span');
            clueText.textContent = `${wordData.position}. ${wordData.clue}`;
            li.appendChild(clueText);
  
            // Создание SVG элемента
            const showAnswerButton = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            showAnswerButton.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            showAnswerButton.setAttribute('width', '24');
            showAnswerButton.setAttribute('height', '24');
            showAnswerButton.setAttribute('fill', 'none');
            showAnswerButton.classList.add('show-answer-button'); // Добавляем класс для стилей

            // Первый путь
            const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path1.setAttribute('stroke', '#62E953');
            path1.setAttribute('stroke-linecap', 'round');
            path1.setAttribute('stroke-linejoin', 'round');
            path1.setAttribute('stroke-width', '2');
            path1.setAttribute('d', 'M3 13c3.6-8 14.4-8 18 0');

            // Второй путь
            const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path2.setAttribute('stroke', '#62E953');
            path2.setAttribute('stroke-linecap', 'round');
            path2.setAttribute('stroke-linejoin', 'round');
            path2.setAttribute('stroke-width', '2');
            path2.setAttribute('d', 'M12 17a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z');

            // Добавляем пути в SVG
            showAnswerButton.appendChild(path1);
            showAnswerButton.appendChild(path2);

            // Добавление обработчика клика
            showAnswerButton.addEventListener('click', () => {
                showAnswerButton.remove();
                const displayWord = wordData.originalWord || wordData.word;
                clueText.textContent += ` (${displayWord})`;
            });

            // Добавление SVG в список
            li.appendChild(showAnswerButton);
            list.appendChild(li);
        });
  
        const container = document.createElement('div');
        container.className = 'clues-section';
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        container.appendChild(titleElement);
        container.appendChild(list);
        return container;
    }
}


/**
 * Базовый класс для отображения игрового поля
 * Содержит общую логику для всех типов игр
 */
class DisplayBase {
/**
 * Отображает индикатор загрузки
 */
static displayLoadingIndicator() {
    if (elements.cluesContainer) {
        elements.cluesContainer.style.display = 'none';
    }

    if (elements.crosswordContainer) {
        elements.crosswordContainer.innerHTML = '<div class="loading-indicator">Загрузка...</div>';
    }
}

/**
 * Скрывает индикатор загрузки
 */
static hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    
    if (loadingIndicator) {
        loadingIndicator.remove();
    }

    if (elements.cluesContainer) {
        elements.cluesContainer.style.display = 'flex';
    }
}

/**
 * Базовый обработчик ввода
 * @param {Event} event - Событие ввода
 * @param {Function} validateInput - Функция валидации ввода
 * @param {Function} onValidInput - Колбэк для обработки правильного ввода
 * @param {Function} onInvalidInput - Колбэк для обработки неправильного ввода
 */
static handleInput(event, validateInput, onValidInput, onInvalidInput) {
    const input = event.target;
    const userInput = input.value.toUpperCase();

    if (validateInput(userInput)) {
        input.classList.remove('invalid');
        input.classList.add('valid');
        if (onValidInput) onValidInput(input, userInput);
    } else {
        input.classList.remove('valid');
        input.classList.add('invalid');
        if (onInvalidInput) onInvalidInput(input, userInput);
    }
}

/**
 * Базовый обработчик нажатия клавиш
 * @param {KeyboardEvent} event - Событие клавиатуры
 * @param {Function} onEnter - Колбэк для обработки нажатия Enter
 * @param {Function} onArrow - Колбэк для обработки нажатия стрелок
 */
static handleKeydown(event, onEnter, onArrow) {
    if (event.key === 'Enter' && onEnter) {
        event.preventDefault();
        onEnter(event.target);
    } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) && onArrow) {
        event.preventDefault();
        onArrow(event.target, event.key);
    }
}

/**
 * Очищает игровое поле
 */
static clearGameField() {
    if (elements.crosswordContainer) {
        elements.crosswordContainer.innerHTML = '';
    }

    if (elements.cluesContainer) {
        elements.cluesContainer.innerHTML = '';
    }
}

/**
 * Создает и добавляет элемент на страницу
 * @param {string} tag - HTML тег элемента
 * @param {Object} attributes - Атрибуты элемента
 * @param {string} content - Содержимое элемента
 * @param {HTMLElement} parent - Родительский элемент
 * @returns {HTMLElement} Созданный элемент
 */
static createElement(tag, attributes = {}, content = '', parent = null) {
    const element = document.createElement(tag);
    
    // Устанавливаем атрибуты
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else {
            element.setAttribute(key, value);
        }
    });

    // Устанавливаем содержимое
    if (content) {
        element.innerHTML = content;
    }

    // Добавляем к родительскому элементу
    if (parent) {
        parent.appendChild(element);
    }

    return element;
}
}

/**
 * Класс, отвечающий за отображение и взаимодействие с кроссвордом
 */
class CrosswordDisplay extends DisplayBase {
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




/**
 * Модуль elements.js
 * Содержит ссылки на DOM-элементы, используемые в приложении
 */

const elements = {
// Элементы формы кроссворда
crosswordForm: document.getElementById('crossword-form'),
gameTypeSelect: document.getElementById('game-type'),
inputTypeSelect: document.getElementById('input-type'),
documentTextarea: document.getElementById('document'),
fileUploadInput: document.getElementById('file-upload'),
topicInput: document.getElementById('topic'),
totalWordsInput: document.getElementById('total-words'),

// Элементы игрового поля
crosswordContainer: document.getElementById('crossword-container'),
cluesContainer: document.getElementById('clues-container')
};


/**
 * Класс, отвечающий за управление состоянием игры и отображение сообщений
 */
class GameStateManager extends DisplayBase {
    /**
     * Проверяет, решен ли кроссворд
     */
    static checkCrosswordSolved() {
        const cells = document.querySelectorAll('.crossword-cell input');

        for (const input of cells) {
            const userInput = input.value.toUpperCase();
            const correctLetter = input.parentNode.dataset.correctLetter;

            if (userInput !== correctLetter) {
                return false;
            }
        }

        // Отображаем сообщение об успехе
        this.displaySuccessMessage();
        return true;
    }

    /**
     * Отображает сообщение об ошибке
     * @param {string} message - Сообщение об ошибке
     */
    static displayError(message) {
        if (elements.crosswordContainer) {
            elements.crosswordContainer.innerHTML = `<div class="error-message">${message}</div>`;
        }
    }

    /**
     * Отображает сообщение об успехе
     */
    static displaySuccessMessage() {
        // Используем метод clearGameField из базового класса
        this.clearGameField();

        const successMessage = document.createElement('div');
        successMessage.classList.add('success-message');
        successMessage.innerHTML = `
            <h2>Поздравляем!</h2>
            <p>Вы успешно решили кроссворд!</p>
        `;

        if (elements.crosswordContainer) {
            elements.crosswordContainer.appendChild(successMessage);
        }
    }
}

/**
 * Класс для управления пользовательским интерфейсом
 */
class UIUtils {
    /**
     * Инициализация всех обработчиков событий
     */
    static initialize() {
        this.initializeInputTypeHandlers();
    }



    /**
     * Инициализация обработчиков для переключения типа ввода
     */
    static initializeInputTypeHandlers() {
        const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
        inputTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleInputs());
        });
        this.toggleInputs();
    }

    /**
     * Переключение видимости полей ввода
     */
    static toggleInputs() {
        const selectedTypeElement = document.querySelector('input[name="inputType"]:checked');
        
        if (selectedTypeElement) {
            const selectedType = selectedTypeElement.value;
            
            elements.documentTextarea.style.display = selectedType === 'text' ? 'block' : 'none';
            elements.fileUploadInput.style.display = selectedType === 'file' ? 'block' : 'none';
            elements.topicInput.style.display = selectedType === 'topic' ? 'block' : 'none';
        }
    }

    /**
     * Показать попап
     * @param {HTMLElement} popup - Элемент попапа
     */
    static showPopup(popup) {
        if (popup) {
            popup.style.display = 'block';
        }
    }

    /**
     * Скрыть попап
     * @param {HTMLElement} popup - Элемент попапа
     */
    static hidePopup(popup) {
        if (popup) {
            popup.style.display = 'none';
        }
    }

    /**
     * Обработка клика вне попапа
     * @param {Event} event - Событие клика
     */
    static handleOutsideClick(event) {
        const popups = document.querySelectorAll('.popup');
        popups.forEach(popup => {
            if (event.target === popup) {
                this.hidePopup(popup);
            }
        });
    }

    /**
     * Показать сообщение об ошибке
     * @param {string} message - Текст сообщения
     */
    static showError(message) {
        alert(message);
    }

    /**
     * Показать сообщение об успехе
     * @param {string} message - Текст сообщения
     */
    static showSuccess(message) {
        alert(message);
    }
}

class WordSoupDisplay extends DisplayBase {
    constructor(gameData) {
        super();
        this.gameData = gameData;
        this.selectedCells = [];
        this.isSelecting = false;
        this.foundWords = new Set();
        this.currentDirection = null; // Добавляем свойство для хранения текущего направления
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
                    style: `width: ${cellSize}px; height: ${cellSize}px; font-size: ${Math.floor(cellSize * 0.6)}px;`
                }, cell, tr);

                td.addEventListener('mousedown', () => this.startSelection(td));
                td.addEventListener('mouseover', () => this.continueSelection(td));
                td.addEventListener('mouseup', () => this.endSelection());
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
        if (!this.isSelecting || this.selectedCells.length === 0) return;

        const selectedWord = this.getSelectedWord();
        const reversedWord = selectedWord.split('').reverse().join('');
        
        const foundWord = this.gameData.words.find(w => {
            const cleanWord = w.word.toUpperCase().replace(/\s+/g, '');
            return cleanWord === selectedWord || cleanWord === reversedWord;
        });

        if (foundWord && !this.foundWords.has(foundWord.word)) {
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
                setTimeout(() => this.showVictoryMessage(), 500);
            }
        } else {
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

        this.selectedCells = [];
        this.isSelecting = false;
        this.currentDirection = null; // Сбрасываем направление
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
        const message = DisplayBase.createElement('div', {
            className: 'victory-message'
        }, 'Поздравляем! Вы нашли все слова!');

        elements.crosswordContainer.appendChild(message);
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
        // Отключаем выделение при выходе за пределы сетки
        document.addEventListener('mouseup', () => {
            if (this.isSelecting) {
                this.endSelection();
            }
        });
    }
}


class GameGenerator extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isAboutVisible: false,
            isManualVisible: false,
            isSlidebarVisible: true,
            isFormCreatingPuzzle: false,
            redirectToProfile: false
        };

        this.crosswordFormRef = createRef();
        this.gameTypeRef = createRef();
        this.inputTypeRef = createRef();
        this.documentTextRef = createRef();
        this.totalWordsRef = createRef();
        this.topicRef = createRef();
        this.fileInputRef = createRef();
        this.crosswordContainerRef = createRef();
        this.cluesContainerRef = createRef();
    }

    componentDidMount() {
        UIUtils.initialize();
        // Инициализация объекта elements
        elements.inputTypeSelect = document.querySelector('input[name="inputType"]:checked');
        elements.documentTextarea = this.documentTextRef.current;
        elements.totalWordsInput = this.totalWordsRef.current;
        elements.topicInput = this.topicRef.current;
        elements.fileUploadInput = this.fileInputRef.current;
        elements.crosswordForm = this.crosswordFormRef.current;
        elements.gameTypeSelect = document.querySelector('input[name="gameType"]:checked');
        elements.crosswordContainer = this.crosswordContainerRef.current;
        elements.cluesContainer = this.cluesContainerRef.current;
    }

    toggleAboutPopup = () => {
        this.setState((prevState) => ({
            isAboutVisible: !prevState.isAboutVisible,
            isManualVisible: false,
        }));
    };

    toggleManualPopup = () => {
        this.setState((prevState) => ({
            isManualVisible: !prevState.isManualVisible,
            isAboutVisible: false,
        }));
    };

    navToProfile = () => {
        this.setState({ redirectToProfile: true});
    };

    toggleSlidebar = () => {
        this.setState((prevState) => ({
        isSlidebarVisible: !prevState.isSlidebarVisible,
        }));
    };

    toggleFormCreatingPuzzle = () => {
        this.setState((prevState) => ({
        isFormCreatingPuzzle: !prevState.isFormCreatingPuzzle,
        }));
    };

    handleSubmit = async (event) => {
        event.preventDefault();
        // Получение значений из формы
        const gameType = document.querySelector('input[name="gameType"]:checked').value;
        const inputType = document.querySelector('input[name="inputType"]:checked');
        const documentText = this.documentTextRef.current.value;
        const totalWords = parseInt(this.totalWordsRef.current.value);
        const topic = this.topicRef.current.value;
        const fileInput = this.fileInputRef.current;
        // Валидация введенных данных
        if (inputType === '') {
            return UIUtils.showError('Выберите тип ввода.');
        }
        if (inputType === 'text' && documentText.trim() === '') {
            return UIUtils.showError('Введите текст.');
        }
    
        if (inputType === 'topic' && topic.trim() === '') {
            return UIUtils.showError('Введите тему.');
        }
    
        if (inputType === 'file' && !fileInput.files.length) {
            return UIUtils.showError('Выберите файл.');
        }
    
        if (isNaN(totalWords) || totalWords < 1) {
            return UIUtils.showError('Введите корректное количество слов (больше 0).');
        }
    
        // Показываем индикатор загрузки
        DisplayBase.displayLoadingIndicator();
    
        try {
            // Отправка данных на сервер
            const formData = new FormData(event.target);
            const response = await axios.post('http://localhost:5000/generate-game', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            // Отображение игры в зависимости от выбранного типа
            if (gameType === 'wordsoup') {
                if (response.data.grid && response.data.words) {
                    const display = new WordSoupDisplay(response.data);
                    display.display();
                } else {
                    UIUtils.showError('Не удалось получить данные для игры');
                }
            } else {
                if (response.data.crossword && response.data.layout.result) {
                    CrosswordDisplay.displayCrossword(response.data.crossword, response.data.layout.result);
                } else {
                    UIUtils.showError('Не удалось получить данные кроссворда');
                }
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.error) {
                UIUtils.showError(error.response.data.error);
            } else {
                UIUtils.showError("Произошла ошибка при генерации игры. Пожалуйста, попробуйте снова.");
            }
        } finally {
            DisplayBase.hideLoadingIndicator();
        }
    }
    render() {
        const { isBlackTheme, toggleTheme } = this.props;
        const {
        isAboutVisible,
        isManualVisible,
        isSlidebarVisible,
        isFormCreatingPuzzle,
        } = this.state;

        if (this.state.redirectToProfile) {
            return <Navigate to='/account'/>
        }
        return (
            <>
                <header className={`main-page-header ${isAboutVisible || isManualVisible ? 'hidden' : ''}`} id='game-header'>
                    <div className='go-to-profile' id='game-go-to-profile' onClick={this.navToProfile}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none">
                            <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M8 33.333v-1.666C8 25.223 13.223 20 19.667 20c6.443 0 11.666 5.223 11.666 11.667v1.666"/>
                            <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M19.667 20a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333Z"/>
                        </svg>
                    </div>
                    <button id='game-about-popup-button' className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={this.toggleAboutPopup}>О проекте</button>
                    <button id='game-manual-popup-button' className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={this.toggleManualPopup}>Инструкция</button>
                    <AboutPopup isVisible={isAboutVisible} page='game'/>
                    <ManualPopup isVisible={isManualVisible} page='game'/>
                </header>
                <main id='game-main-page'>
                    <svg id='game-logotype' xmlns="http://www.w3.org/2000/svg" width="1000" height="124" fill="none">
                        <path fill="#FBFBFE" fill-opacity="0.8" d="M64.104 121.404c-11.586 
                            0-22.316-2.717-32.159-8.151-9.859-5.434-17.639-12.811-23.355-22.131C2.858 
                            81.817 0 71.677 0 60.702c0-10.974 2.858-21.114 8.59-30.42 5.716-9.32 
                            13.512-16.681 23.355-22.13C41.788 2.716 52.518 0 64.104 
                            0h57.165v57.514H83.653c-.55-3.946-2.476-7.331-5.778-10.124-3.316-2.793-7.107-4.19-11.387-4.19-4.83 
                            0-8.956 1.716-12.395 5.146-3.44 3.43-5.152 7.544-5.152 12.341s1.712 
                            8.895 5.151 12.31c3.44 3.416 7.566 5.116 12.396 5.116 4.326 0 
                            8.178-1.427 11.57-4.266 3.379-2.838 5.243-6.269 
                            5.595-10.26h37.616v57.817H64.104ZM177.18 124c-6.97 
                            0-13.634-1.305-20.008-3.931-6.373-2.626-11.845-6.148-16.415-10.596-4.586-4.447-8.224-9.73-10.929-15.862-2.705-6.133-4.066-12.553-4.066-19.278 0-6.724 1.361-13.13 
                            4.066-19.232 2.705-6.102 6.358-11.37 10.929-15.786 4.57-4.418 10.057-7.94 16.415-10.565 6.374-2.626 13.038-3.932 20.008-3.932 9.308 0 17.868 2.201 25.709 6.603 7.841 
                            4.402 14.046 10.398 18.617 18.018 4.57 7.605 6.862 15.908 6.862 24.91 0 6.724-1.36 13.145-4.065 19.277-2.706 6.133-6.359 11.415-10.929 15.863-4.585 4.447-10.027 7.984-16.339 
                            10.595-6.313 2.626-12.931 3.931-19.855 3.931V124Zm-8.468-57.773c-2.308 2.292-3.469 5.055-3.469 8.258 0 3.203 1.161 5.966 3.469 8.258 2.308 2.292 5.09 3.445 8.315 3.445 
                            3.225 0 5.931-1.153 8.254-3.445 2.323-2.292 3.469-5.055 3.469-8.258 
                            0-3.203-1.161-5.966-3.469-8.258-2.308-2.292-5.059-3.445-8.254-3.445-3.194 
                            0-6.007 1.153-8.315 3.445ZM232.923 121.404V27.277h102.239v94.127h-42.323V70.265c0-2.52-.825-4.614-2.461-6.3-1.635-1.684-3.729-2.519-6.266-2.519-2.538 
                            0-4.647.835-6.344 2.52-1.696 1.685-2.537 3.78-2.537 
                            6.3v51.138h-42.323.015ZM443.546 27.277v94.127H341.307V27.277h42.323v51.14c0 
                            2.52.826 4.614 2.461 6.299 1.635 1.685 3.729 2.52 6.267 2.52 2.537 0 
                            4.646-.835 6.343-2.52 1.696-1.685 2.537-3.78 2.537-6.3V27.277h42.323-.015ZM449.66 
                            121.404V27.277h102.239v94.127h-42.323V70.265c0-2.52-.826-4.614-2.461-6.3-1.635-1.684-3.729-2.519-6.267-2.519-2.537 
                            0-4.646.835-6.343 2.52-1.696 1.685-2.537 3.78-2.537 6.3v51.138h-42.323.015ZM607.062 
                            121.404c-6.924 0-13.497-1.244-19.748-3.749-6.252-2.489-11.617-5.844-16.126-10.049-4.509-4.204-8.085-9.183-10.745-14.966-2.659-5.784-3.989-11.84-3.989-18.155 
                            0-8.698 2.247-16.667 6.756-23.907 4.509-7.241 10.623-12.933 18.357-17.077 7.734-4.144 
                            16.232-6.224 25.479-6.224h9.63V0h42.384v121.404h-52.014.016Zm-8.361-47.07c0 3.263 
                            1.116 6.025 3.362 8.302 2.232 2.277 4.968 3.416 8.208 3.416 3.241 0 6.007-1.139 
                            8.315-3.416s3.47-5.04 3.47-8.303c0-3.263-1.162-5.874-3.47-8.151-2.308-2.277-5.09-3.415-8.315-3.415-3.225 0-5.915 1.123-8.177 3.37-2.262 2.246-3.393 4.978-3.393 
                            8.196ZM665.128 121.404V27.277h65.602V64.33h-21.72v57.074h-43.882ZM837.814 
                            27.277v94.127H735.575V27.277h42.323v51.14c0 2.52.826 4.614 2.461 6.299 
                            1.636 1.685 3.73 2.52 6.267 2.52 2.537 0 4.646-.835 6.343-2.52s2.537-3.78 
                            2.537-6.3V27.277h42.324-.016ZM843.944 121.404V27.277H1000v94.127h-42.323V68.702c0-2.02-.703-3.75-2.094-5.146-1.391-1.412-3.118-2.11-5.151-2.11s-3.775.698-5.182 
                            2.11c-1.406 1.412-2.124 3.127-2.124 5.146v52.702h-42.324V68.702c0-2.02-.687-3.75-2.048-5.146-1.375-1.412-3.072-2.11-5.105-2.11-2.033 0-3.775.698-5.227 2.11-1.437 
                            1.412-2.171 3.127-2.171 5.146v52.702h-42.323.016Z"/>
                    </svg>
                    <section className={`game-generator-slidebar-hidden ${isSlidebarVisible ? '' : 'visible'}`}>
                        <div className='generator-slidebar-hidden'>
                            <div className='game-menu-handler' onClick={this.toggleSlidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 8 8 8-8 8"/>
                                </svg>
                            </div>
                            <div className='game-puzzle-creator' onClick={() => {this.toggleFormCreatingPuzzle(); this.toggleSlidebar()}}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                    1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                    9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                    0-2H17v-4.333Z" clip-rule="evenodd"/>
                                </svg>
                            </div>
                            <div className='game-my-puzzles'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                    16h16M10.667 24h16"/>
                                </svg>
                            </div>
                        </div>
                    </section>
                    <section className={`game-generator-slidebar-visible ${isSlidebarVisible ? 'visible' : ''}`}>
                        <div className='generator-slidebar-visible'>
                            <div className='game-menu-handler-open' onClick={this.toggleSlidebar}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <rect width="32" height="32" x="32" y="32" fill="#FBFBFE" fill-opacity="1" rx="16" 
                                    transform="rotate(180 32 32)"/>
                                    <path stroke="#2F2D38" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="m20 24-8-8 8-8"/>
                                </svg>
                                <p>Свернуть меню</p>
                            </div>
                            <div className='game-puzzle-creator-open'
                            onClick={this.toggleFormCreatingPuzzle}>
                                {isFormCreatingPuzzle ?
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" transform='rotate(45)'>
                                        <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                        1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                        9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                        0-2H17v-4.333Z" clip-rule="evenodd"/>
                                    </svg>
                                    <p>Отменить</p>
                                </>
                                : 
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                        <path fill="#FBFBFE" fill-rule="evenodd" d="M16 1.667C8.084 1.667 1.667 8.084 
                                        1.667 16S8.084 30.333 16 30.333 30.333 23.916 30.333 16 23.916 1.667 16 1.667Zm1 
                                        9a1 1 0 0 0-2 0V15h-4.333a1 1 0 1 0 0 2H15v4.333a1 1 0 1 0 2 0V17h4.333a1 1 0 1 0 
                                        0-2H17v-4.333Z" clip-rule="evenodd"/>
                                    </svg>
                                    <p>Создать головоломку</p>
                                </>
                                }
                            </div>
                            <div className={`creating-puzzle-input-data ${isFormCreatingPuzzle ? 'visible' : 'hidden'}`}>
                                <form id='crossword-form' encType='multipart/form-data' 
                                onSubmit={this.handleSubmit} ref={this.crosswordFormRef}>
                                    <input className='input-puzzle-name' type='text' placeholder='НАЗВАНИЕ' required/>
                                    <div className='input-type-of-puzzle'>
                                        <h2>ВИД ГОЛОВОЛОМКИ</h2>
                                        <div>
                                            <input type="radio" id="crossword" value='crossword' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="crossword">Кроссворд</label>
                                        </div>
                                        <div>
                                            <input type="radio" id="fillword" value='wordsoup' name="gameType" ref={this.gameTypeRef} required/>
                                            <label for="fillword">Суп из слов</label>
                                        </div>
                                    </div>
                                    <div className='input-interaction-format'>
                                        <h2>ФОРМАТ ВЗАИМОДЕЙСТВИЯ</h2>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="set-topic" 
                                            value='topic' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>
                                            <label for="set-topic">Задать тему</label>
                                            
                                                <div className='topic-input'>
                                                    <input
                                                        ref={this.topicRef}
                                                        type='text'
                                                        id='topic'
                                                        name='topic'
                                                        placeholder='Например: Фрукты'
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                        </div>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="set-text" 
                                            value='text' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>
                                            <label for="set-text">Задать текст</label>
                                            
                                                <div className='text-input'>
                                                    <textarea
                                                        ref={this.documentTextRef}
                                                        className='text-input-textarea'
                                                        id='document'
                                                        name='text'
                                                        placeholder='Например: Однажды весною, в час небывало жаркого заката...'
                                                        style={{ display: 'none' }}
                                                    />
                                                </div>
                                        </div>
                                        <div>
                                            <input 
                                            type="radio" 
                                            id="upload-file" 
                                            value='file' 
                                            name='inputType' 
                                            onChange={this.handleInteractionFormatChange}
                                            required
                                            ref={this.inputTypeRef}/>
                                            <label for="upload-file">Загрузить файл</label>
                                            
                                                <div className='file-input'>
                                                    <input type='file' 
                                                    className='text-input-textarea' 
                                                    id='file-upload' 
                                                    style={{ display: 'none' }}
                                                    ref={this.fileInputRef}
                                                    name='file-upload'/>
                                                    <label for="file-upload" class="file-input-label">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                                            <path fill="#FBFBFE" fill-rule="evenodd" d="M4.8 3A1.8 1.8 0 0 0 3 4.8v22.4A1.8 1.8 0 0 0 4.8 29h22.4a1.8 1.8 0 0 0 1.8-1.8V4.8A1.8 1.8 0 0 0 27.2 3H4.8ZM17 12a1 1 0 1 0-2 0v3h-3a1 1 0 1 0 0 2h3v3a1 1 0 1 0 2 0v-3h3a1 1 0 1 0 0-2h-3v-3Z" clip-rule="evenodd"/>
                                                        </svg>
                                                    </label>
                                                </div>
                                        </div>
                                    </div>
                                    <div className='input-puzzle-size'>
                                        <h2>КОЛИЧЕСТВО СЛОВ</h2>
                                        <input type="number" ref={this.totalWordsRef} id='total-words' name="totalWords" min="5" max="20" step="1" required/>
                                    </div>
                                    <button className='open-full-settings-button'>
                                        Продвинутые настройки
                                    </button>
                                    <button type='submit' className='generate-puzzle-button'>
                                        Генерировать
                                    </button>
                                </form>
                            </div>
                            <div className='game-my-puzzles-open'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none">
                                    <path stroke="#FBFBFE" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M10.667 8h16M5.333 8.013 5.347 8M5.333 16.013l.014-.015M5.333 24.013l.014-.015M10.667 
                                    16h16M10.667 24h16"/>
                                </svg>
                                <p>Мои головоломки</p>
                            </div>
                        </div>
                    </section>
                    <section id='crossword-and-clues'>
                        <div id="crossword-container" ref={this.crosswordContainerRef}></div>
                        <div id="clues-container" ref={this.cluesContainerRef}></div> 
                    </section>
                    
                    <div className='game-theme-changer'>
                        <ThemeChanger 
                            isBlackTheme={isBlackTheme} 
                            toggleTheme={toggleTheme}
                            page='game' />
                    </div>
                </main>
            </>
        );
    }
    
}

export default GameGenerator;

