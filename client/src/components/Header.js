import React, { useState } from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { useNavigate } from 'react-router-dom';
import '../css/header.css';
import NewThemeChanger from './NewThemeChanger';

const Header = ({ isAuth, isBlackTheme, toggleTheme }) => {
  const [isAboutVisible, setIsAboutVisible] = useState(false);
  const [isManualVisible, setIsManualVisible] = useState(false);
  const navigate = useNavigate();

  // Проверяем, является ли пользователь LTI пользователем
  const isLTIMode = localStorage.getItem('lti') === 'true';

  if (isLTIMode) {
    return null;
  }

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
  const navToProfile = () => navigate('/account');

  const startOnClick = isAuth ? navToGame : navToRegister;
  const profileOnClick = isAuth ? navToProfile : navToRegister;

  return (
    <header className='main-page-header'>
      <button className='go-main-page-button' onClick={() => navigate('/')}>
        <svg viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M43.9934 0V40H0V0H18.2117V21.732C18.2117 22.8028 18.5668 23.693 19.2706 24.409C19.9743 25.125 20.8753 25.4798 21.9671 25.4798C23.0589 25.4798 23.9665 25.125 24.6966 24.409C25.4266 23.693 25.7883 22.8028 25.7883 21.732V0H44H43.9934Z" fill="#FBFBFE"/>
        </svg>
      </button>
      <button className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={toggleAboutPopup}>О проекте</button>
      <button className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={toggleManualPopup}>Инструкция</button>
      <button className='go-to-landing-button' onClick={() => window.open('https://conundrum-landing.onrender.com/', '_blank')}>О нас</button>
      
      <div className='functional-buttons-wrapper'>
        <button className='start-button' onClick={startOnClick}>
          <svg fill="#000000" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.52.55l-5,5h0L.55,12.51l3,3,12-12Zm-4,6,4-4,1,1-4,4.05ZM2.77,3.18A3.85,3.85,0,0,1,5.32,5.73h0A3.85,3.85,0,0,1,7.87,3.18h0A3.82,3.82,0,0,1,5.32.64h0A3.82,3.82,0,0,1,2.77,3.18ZM8.5,2.55h0A2,2,0,0,1,9.78,1.27h0A1.92,1.92,0,0,1,8.5,0h0A1.88,1.88,0,0,1,7.23,1.27h0A1.92,1.92,0,0,1,8.5,2.55Zm-6.36,0h0A1.92,1.92,0,0,1,3.41,1.27h0A1.88,1.88,0,0,1,2.14,0h0A1.92,1.92,0,0,1,.86,1.27h0A2,2,0,0,1,2.14,2.55ZM14.73,6.22h0a1.94,1.94,0,0,1-1.28,1.27h0a1.94,1.94,0,0,1,1.28,1.27h0A1.9,1.9,0,0,1,16,7.49h0A1.9,1.9,0,0,1,14.73,6.22Z"/>
          </svg>
        </button> 
        <button className='go-to-profile-button-if-logged-in' onClick={profileOnClick}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.25 7a5.75 5.75 0 1 1 11.5 0 5.75 5.75 0 0 1-11.5 0ZM11.797 14.261a.755.755 0 0 1 .13-.011h.144c.044 0 .088.004.131.011l7.295 1.283a.64.64 0 0 1 .038.008c1.343.31 2.787 1.163 3.068 2.82a.73.73 0 0 1 .005.029l.113.877v.002c.265 2.009-1.328 3.47-3.21 3.47a.753.753 0 0 1-.123-.01h-14.9c-1.882 0-3.475-1.462-3.21-3.472l.114-.869a.753.753 0 0 1 .005-.03c.28-1.627 1.735-2.528 3.077-2.819a.719.719 0 0 1 .029-.006l7.294-1.283Z" fill="#000000"/>
          </svg>
        </button>
        <NewThemeChanger isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
      </div>
      <AboutPopup isVisible={isAboutVisible}/>
      <ManualPopup isVisible={isManualVisible}/>
    </header>
  );
};

export default Header;