import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Preloader from '../assets/svg/Preloader';

describe('Preloader Component', () => {
    test('рендерится без ошибок', () => {
        const { container } = render(<Preloader />);
        
        // Проверяем, что отрисовался SVG
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();
        
        // Можно проверить наличие анимации (если есть теги animateTransform)
        // Но достаточно просто наличия в DOM
    });
});