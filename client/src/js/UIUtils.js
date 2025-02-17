import { elements } from './elements.js';
/**
 * Класс для управления пользовательским интерфейсом
 */
export class UIUtils {
    /**
     * Инициализация всех обработчиков событий
     */
    static initialize() {
        elements.initialize();
        this.initializeInputTypeHandlers();
    }



    /**
     * Инициализация обработчиков для переключения типа ввода
     */
    static initializeInputTypeHandlers() {
        const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
        if (!inputTypeRadios.length) {
            console.warn('Input type radio buttons not found');
            return;
        }
        inputTypeRadios.forEach(radio => {
            radio.addEventListener('change', () => this.toggleInputs());
        });
        const selectedRadio = document.querySelector('input[name="inputType"]:checked');
          if (selectedRadio) {
            this.toggleInputs();
        }
    }

    /**
     * Переключение видимости полей ввода
     */
    static toggleInputs() {
        const selectedTypeElement = document.querySelector('input[name="inputType"]:checked');
        
        if (selectedTypeElement) {
            const selectedType = selectedTypeElement.value;
            
            elements.documentTextarea.style.display = selectedType === 'text' ? 'block' : 'none';
            elements.topicInput.style.display = selectedType === 'topic' ? 'block' : 'none';
            elements.fileUploadInput.parentElement.style.display = selectedType === 'file' ? 'flex' : 'none';

            if (selectedType === 'text') {
                elements.documentTextarea.parentElement.style.padding = '8px';
                elements.documentTextarea.parentElement.style.marginTop = '15px';
                elements.topicInput.parentElement.style.padding = '0px';
                elements.topicInput.parentElement.style.marginTop = '0px';
            }
            else if (selectedType === 'topic') {
                elements.documentTextarea.parentElement.style.padding = '0px';
                elements.documentTextarea.parentElement.style.marginTop = '0px';
                elements.topicInput.parentElement.style.padding = '8px';
                elements.topicInput.parentElement.style.marginTop = '15px';
            }
            else if (selectedType === 'file') {
                elements.documentTextarea.parentElement.style.padding = '0px';
                elements.documentTextarea.parentElement.style.marginTop = '0px';
                elements.topicInput.parentElement.style.padding = '0px';
                elements.topicInput.parentElement.style.marginTop = '0px';
            }
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
        console.error(message);
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