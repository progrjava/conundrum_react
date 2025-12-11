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
            <div>
                <h2>Поздравляем! Вы успешно решили кроссворд!</h2>
                <div class='success-divider'></div>
            </div>
            <div>
                <p>Главный трофей — не сохранённый файл, а новые нейронные связи в вашей голове.</p>
                <p>Ваша победа — лучший результат. Возвращайтесь за новыми победами!</p> 
                <p>Или помучаем нейронную сеть еще немного, сгенерируем еще одну игру?</p>
            </div>
        `;

        if (elements.crosswordContainer) {
            elements.crosswordContainer.appendChild(successMessage);
        }
    }
}
