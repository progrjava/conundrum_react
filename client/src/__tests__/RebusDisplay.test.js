import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RebusDisplay from '../components/RebusDisplay'; // Проверь путь к компоненту
import '@testing-library/jest-dom';
// Фейковые данные для теста
const mockGameData = {
    rebuses: [
        {
            word: "ТЕСТ",
            parts: [
                { type: "text", content: "Т" },
                { 
                    type: "image", 
                    imageUrl: "https://via.placeholder.com/150", 
                    subtract_start: 0, 
                    subtract_end: 0 
                },
                { type: "text", content: "СТ" }
            ]
        }
    ]
};

describe('RebusDisplay Component', () => {
    
    test('рендерит заголовок и карточку ребуса', () => {
        render(<RebusDisplay gameData={mockGameData} />);
        
        // Проверяем заголовок
        expect(screen.getByText(/Ребусы/i)).toBeInTheDocument();
        // Проверяем текстовую часть
        expect(screen.getByText("Т")).toBeInTheDocument();
        // Проверяем наличие картинки
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThan(0);
    });

    test('показывает ответ при клике на кнопку', () => {
        render(<RebusDisplay gameData={mockGameData} />);
        
        // Сначала ответа нет
        expect(screen.queryByText("ТЕСТ")).not.toBeInTheDocument();
        
        // Находим кнопку и кликаем
        const button = screen.getByText(/Показать ответ/i);
        fireEvent.click(button);
        
        // Теперь ответ должен появиться
        expect(screen.getByText("ТЕСТ")).toBeInTheDocument();
    });
});