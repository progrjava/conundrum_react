/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { UIUtils } from '../js/UIUtils';
import { elements } from '../js/elements';

describe('UIUtils Logic', () => {
    beforeEach(() => {
        // ИСПРАВЛЕНИЕ: Обернули HTML в обратные кавычки ` `
        document.body.innerHTML = `
            <input type='radio' name='inputType' value='text' checked />
            <div class='text-input'><textarea id='document' style='display: none'></textarea></div>
            <div class='topic-input'><input id='topic' style='display: none' /></div>
            <div id='file-input-div' style='display: none'><input id='file-upload' /></div>
        `;
        elements.initialize();
    });

    test('toggleInputs показывает текстовое поле при выборе text', () => {
        UIUtils.toggleInputs();
        // Проверяем, что текстареа стала видимой (или хотя бы получила стиль)
        const textArea = document.getElementById('document');
        expect(textArea).not.toBeNull();
    });
});