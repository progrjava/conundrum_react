import React, { useState, useEffect } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { useNavigate } from 'react-router-dom';

const GameGenerator = () => {
    const [isAboutVisible, setIsAboutVisible] = useState(false);
    const [isManualVisible, setIsManualVisible] = useState(false);
    const navigate = useNavigate();

    const toggleAboutPopup = () => {
        setIsAboutVisible(!isAboutVisible);
        setIsManualVisible(false);
      };
    
      const toggleManualPopup = () => {
        setIsManualVisible(!isManualVisible);
        setIsAboutVisible(false);
      };

    const navToProfile = () => navigate('/account');

    return (
        <>
            <header className={`main-page-header ${isAboutVisible || isManualVisible ? 'hidden' : ''}`} id='game-header'>
                <div className='go-to-profile' id='game-go-to-profile' onClick={navToProfile}>
                    <p>P</p>
                    <p>R</p>
                </div>
                <button id='game-about-popup-button' className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={toggleAboutPopup}>О проекте</button>
                <button id='game-manual-popup-button' className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={toggleManualPopup}>Инструкция</button>
                <AboutPopup isVisible={isAboutVisible} page='game'/>
                <ManualPopup isVisible={isManualVisible} page='game'/>
            </header>
        </>
    );
}

export default GameGenerator;
