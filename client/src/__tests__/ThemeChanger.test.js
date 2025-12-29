import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ThemeChanger from '../components/ThemeChanger';

describe('ThemeChanger Component', () => {
    
    test('вызывает функцию toggleTheme при клике', () => {
        const mockToggle = jest.fn(); // Шпион (mock function)
        
        // Рендерим в черной теме
        const { container } = render(
            <ThemeChanger isBlackTheme={true} toggleTheme={mockToggle} />
        );

        // Ищем SVG иконку (солнце или луна) или кнопку
        // В твоем коде это svg с классом theme-switcher-icon или black-theme-switch
        const switcher = container.querySelector('svg');
        
        // Кликаем
        fireEvent.click(switcher);

        // Проверяем, что функция смены темы вызвалась
        expect(mockToggle).toHaveBeenCalled();
    });

    test('рендерит разные иконки в зависимости от темы', () => {
        const { container, rerender } = render(
            <ThemeChanger isBlackTheme={true} toggleTheme={() => {}} />
        );
        // Проверяем наличие класса для темной темы (по твоему коду)
        expect(container.querySelector('.black-theme-switch')).toBeInTheDocument();

        // Перерендериваем со светлой темой
        rerender(<ThemeChanger isBlackTheme={false} toggleTheme={() => {}} />);
        expect(container.querySelector('.white-theme-switch')).toBeInTheDocument();
    });
});