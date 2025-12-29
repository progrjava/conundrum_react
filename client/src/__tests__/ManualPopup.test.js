import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ManualPopup from '../components/ManualPopup';

describe('ManualPopup Component', () => {
    test('рендерит инструкцию', () => {
        render(<ManualPopup isVisible={true} />);
        expect(screen.getByText(/Как пользоваться нашим сервисом/i)).toBeInTheDocument();
    });
});
