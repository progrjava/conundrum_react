import { elements } from './elements.js';
import { DisplayBase } from './DisplayBase.js';

/**
 * Класс, отвечающий за управление состоянием игры и отображение сообщений
 */
export class GameStateManager extends DisplayBase {
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
        document.getElementById('clues-container').style.padding = '0px';
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
