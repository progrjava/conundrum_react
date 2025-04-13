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
            elements.crosswordContainer.style.borderRadius = '50%';
            elements.crosswordContainer.innerHTML = `
                <div class="loading-indicator" id='loading-indicator'>
                    <div class="loading-spinner" style="
                        width: 80px;
                        height: 80px;
                        background: url('data:image/svg+xml,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; viewBox=&quot;0 0 200 200&quot;><path fill=&quot;%23FBFBFE&quot; stroke=&quot;%23FBFBFE&quot; stroke-width=&quot;15&quot; transform-origin=&quot;center&quot; d=&quot;m148 84.7 13.8-8-10-17.3-13.8 8a50 50 0 0 0-27.4-15.9v-16h-20v16A50 50 0 0 0 63 67.4l-13.8-8-10 17.3 13.8 8a50 50 0 0 0 0 31.7l-13.8 8 10 17.3 13.8-8a50 50 0 0 0 27.5 15.9v16h20v-16a50 50 0 0 0 27.4-15.9l13.8 8 10-17.3-13.8-8a50 50 0 0 0 0-31.7Zm-47.5 50.8a35 35 0 1 1 0-70 35 35 0 0 1 0 70Z&quot;><animateTransform type=&quot;rotate&quot; attributeName=&quot;transform&quot; calcMode=&quot;spline&quot; dur=&quot;2&quot; values=&quot;0;300&quot; keyTimes=&quot;0;1&quot; keySplines=&quot;0 0 1 1&quot; repeatCount=&quot;indefinite&quot;></animateTransform></path></svg>') no-repeat center center;
                        background-size: 90% 90%;
                        ">
                    </div>
                </div>
            `;
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
        if (elements.crosswordContainer) {
            elements.crosswordContainer.style.borderRadius = '15px';
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