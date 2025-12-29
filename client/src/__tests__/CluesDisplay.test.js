/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { CluesDisplay } from '../js/CluesDisplay';

describe('CluesDisplay Logic', () => {
    beforeEach(() => {
        document.body.innerHTML = '<div id="clues-container"></div>';
    });

    test('displayCrosswordClues рендерит списки слов', () => {
        const words = [
            { position: 1, orientation: 'across', clue: 'Test Clue 1', word: 'TEST' },
            { position: 2, orientation: 'down', clue: 'Test Clue 2', word: 'TEST2' }
        ];
        
        CluesDisplay.displayCrosswordClues(words);
        
        expect(document.querySelector('#clues-container')).toHaveTextContent('Test Clue 1');
        expect(document.querySelector('#clues-container')).toHaveTextContent('Test Clue 2');
        expect(document.querySelectorAll('h3')).toHaveLength(2); // По горизонтали + По вертикали
    });
});
