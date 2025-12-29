/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { elements } from '../js/elements';

describe('elements.js', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="crossword-container"></div><input id="total-words" />';
    });

    test('initialize находит элементы в DOM', () => {
        elements.initialize();
        expect(elements.crosswordContainer).toBeInTheDocument();
        expect(elements.totalWordsInput).toBeInTheDocument();
    });
});
