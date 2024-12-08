import React, { useState } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuth }) => {
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

  const navToRegister = () => navigate('/register');
  const navToGame = () => navigate('/gamegenerator');

  return (
    <header className='main-page-header'>
      { !isAuth ? 
        <button className='start-button' onClick={navToRegister}>Начать</button> 
        :
        <button className='start-button' onClick={navToGame}>Создать</button>
      }
      <button className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={toggleAboutPopup}>О проекте</button>
      <button className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={toggleManualPopup}>Инструкция</button>
      <AboutPopup isVisible={isAboutVisible}/>
      <ManualPopup isVisible={isManualVisible}/>
    </header>
  );
};

export default Header;