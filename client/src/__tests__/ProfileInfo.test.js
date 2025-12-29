import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileInfo from '../components/ProfileInfo';

describe('ProfileInfo Component', () => {
    
    // Фейковые данные юзера
    const mockUserData = {
        username: 'TestUser123',
        email: 'test@example.com',
        gender: 'МУЖСКОЙ',
        occupation: 'СТУДЕНТ'
    };

    // Заглушки для функций
    const mockUpdate = jest.fn();
    const mockLogout = jest.fn();

    test('отображает данные пользователя', () => {
        render(
            <ProfileInfo 
                userData={mockUserData}
                newUsername={mockUserData.username} // Эмуляция стейта
                newOccupation={mockUserData.occupation}
                newGender={mockUserData.gender}
                onUpdateProfile={mockUpdate}
                onLogout={mockLogout}
            />
        );

        // Проверяем, что почта видна текстом
        expect(screen.getByText('test@example.com')).toBeInTheDocument();

        // Проверяем, что логин есть в поле ввода (по значению)
        expect(screen.getByDisplayValue('TestUser123')).toBeInTheDocument();
    });

    test('кнопки вызывают соответствующие функции', () => {
        render(
            <ProfileInfo 
                userData={mockUserData}
                onUpdateProfile={mockUpdate}
                onLogout={mockLogout}
            />
        );

        // Находим кнопки по тексту
        const updateBtn = screen.getByText(/Обновить/i);
        const logoutBtn = screen.getByText(/Выйти/i);

        // Кликаем
        fireEvent.click(updateBtn);
        fireEvent.click(logoutBtn);

        // Проверяем, что функции сработали
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockLogout).toHaveBeenCalled();
    });
});