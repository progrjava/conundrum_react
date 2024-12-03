import React from 'react';
import AboutPopup from './AboutPopup';
import ManualPopup from './ManualPopup';
import { useNavigate } from 'react-router-dom';

const Header = ({ isAuth }) => {
  const [isAboutVisible, setIsAboutVisible] = React.useState(false);
  const [isManualVisible, setIsManualVisible] = React.useState(false);
  const navigate = useNavigate();

  const toggleAboutPopup = () => {
    setIsAboutVisible(!isAboutVisible);
    setIsManualVisible(false);
  };

  const toggleManualPopup = () => {
    setIsManualVisible(!isManualVisible);
    setIsAboutVisible(false);
  };

  const handleStart = () => {
    if (isAuth) {
      navigate('/account');
    } else {
      navigate('/register');
    }
  };

  return (
    <header className='main-page-header'>
      <button className='start-button' onClick={handleStart}>Начать</button>
      <button className={`about-button ${isAboutVisible ? 'pressed' : ''}`} onClick={toggleAboutPopup}>О проекте</button>
      <button className={`manual-button ${isManualVisible ? 'pressed' : ''}`} onClick={toggleManualPopup}>Инструкция</button>
      <AboutPopup isVisible={isAboutVisible}/>
      <ManualPopup isVisible={isManualVisible}/>
    </header>
  );
};

export default Header;