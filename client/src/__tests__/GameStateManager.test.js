/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { GameStateManager } from '../js/GameStateManager';
import { elements } from '../js/elements';

describe('GameStateManager Logic', () => {
    beforeEach(() => {
        // ИСПРАВЛЕНИЕ: Добавили id="clues-container", чтобы код не падал
        document.body.innerHTML = `
            <div id='crossword-container'>
                <div class='crossword-cell' data-correct-letter='A'><input value='A' /></div>
                <div class='crossword-cell' data-correct-letter='B'><input value='B' /></div>
            </div>
            <div id='clues-container'></div>
        `;
        elements.crosswordContainer = document.getElementById('crossword-container');
    });

    test('checkCrosswordSolved возвращает true, если все буквы верны', () => {
        const isSolved = GameStateManager.checkCrosswordSolved();
        expect(isSolved).toBe(true);
        // Проверяем, что появилось сообщение об успехе
        expect(document.querySelector('.success-message')).toBeInTheDocument();
    });

    test('checkCrosswordSolved возвращает false, если есть ошибка', () => {
        const input = document.querySelector('input');
        if (input) input.value = 'Z'; // Ошибка
        
        const isSolved = GameStateManager.checkCrosswordSolved();
        expect(isSolved).toBe(false);
    });
});