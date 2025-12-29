/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { CrosswordDisplay } from '../js/CrosswordDisplay';
import { elements } from '../js/elements';

// Мокаем зависимости, чтобы тест был изолированным
jest.mock('../js/CluesDisplay', () => ({
    CluesDisplay: {
        displayCrosswordClues: jest.fn() // Заглушка, чтобы не падало
    }
}));

// Фейковые данные кроссворда
const mockGrid = [
    ['T', 'E', 'S', 'T'],
    ['', '', '', ''],
    ['', '', '', '']
];

const mockWords = [
    {
        word: "TEST",
        clue: "Test clue",
        answer: "TEST",
        startx: 1, // 1-based index
        starty: 1, // 1-based index
        orientation: "across",
        position: 1
    }
];

describe('CrosswordDisplay Logic', () => {
    
    // Перед каждым тестом создаем нужные DIV-ы в виртуальном DOM
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="crossword-container"></div>
            <div id="clues-container"></div>
            <div id="preloader-container"></div>
        `;
        // Инициализируем ссылки на элементы (если у тебя есть такой метод)
        if (elements.initialize) elements.initialize();
        // Либо вручную патчим elements, если initialize нет
        elements.crosswordContainer = document.getElementById('crossword-container');
    });

    test('генерирует таблицу кроссворда в DOM', () => {
        // Вызываем метод отрисовки
        CrosswordDisplay.displayCrossword(mockGrid, mockWords, jest.fn(), jest.fn());

        // Проверяем, что таблица появилась
        const table = document.querySelector('.crossword-table');
        expect(table).toBeInTheDocument();

        // Проверяем, что есть ячейки ввода (input)
        const inputs = document.querySelectorAll('.crossword-input');
        expect(inputs.length).toBeGreaterThan(0);
    });

    test('ячейки содержат правильные атрибуты ответа', () => {
        CrosswordDisplay.displayCrossword(mockGrid, mockWords, jest.fn(), jest.fn());

        // Первая ячейка должна ждать букву "T"
        const firstCell = document.querySelector('td[data-correct-letter="T"]');
        expect(firstCell).toBeInTheDocument();
    });
});