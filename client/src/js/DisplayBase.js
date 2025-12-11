import { elements } from './elements.js';


/**
 * Базовый класс для отображения игрового поля
 * Содержит общую логику для всех типов игр
 */
export class DisplayBase {
    /**
     * Отображает индикатор загрузки
     */
    static displayLoadingIndicator() {
        if (elements.cluesContainer) {
            elements.cluesContainer.style.display = 'none';
        }
    
        if (elements.crosswordContainer) {
            elements.crosswordContainer.style.display = 'none';
        }

        elements.preloaderContainer.style.display = 'flex';
    }
    
    /**
     * Скрывает индикатор загрузки
     */
    static hideLoadingIndicator() {
        //const loadingIndicator = document.querySelector('.loading-indicator');
        
        /*if (loadingIndicator) {
            loadingIndicator.remove();
        }*/

        if (elements.cluesContainer) {
            elements.cluesContainer.style.display = 'flex';
        }

        if (elements.crosswordContainer) {
            elements.crosswordContainer.style.display = 'flex';
        }

        elements.preloaderContainer.style.display = 'none';
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