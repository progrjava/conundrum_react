import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutPopup from '../components/AboutPopup';

describe('AboutPopup Component', () => {
    test('отображает контент при isVisible=true', () => {
        render(<AboutPopup isVisible={true} />);
        expect(screen.getByText(/Что такое CONUNDRUM/i)).toBeInTheDocument();
    });
});
