/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { DisplayBase } from '../js/DisplayBase';
import { elements } from '../js/elements';

describe('DisplayBase Class', () => {
    test('createElement создает DOM элемент с атрибутами', () => {
        const el = DisplayBase.createElement('div', { className: 'test-class', id: 'test-id' }, 'Content');
        expect(el.tagName).toBe('DIV');
        expect(el).toHaveClass('test-class');
        expect(el).toHaveAttribute('id', 'test-id');
        expect(el).toHaveTextContent('Content');
    });

    test('displayLoadingIndicator показывает прелоадер', () => {
        document.body.innerHTML = '<div id="preloader-container" style="display: none"></div>';
        elements.preloaderContainer = document.getElementById('preloader-container');
        
        DisplayBase.displayLoadingIndicator();
        expect(elements.preloaderContainer.style.display).toBe('flex');
    });
});
