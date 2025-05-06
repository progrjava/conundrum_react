import React from 'react';
import Header from './Header';
import Main from './Main';
import '../css/main.css';

const MainPage = ({ isBlackTheme, toggleTheme, isAuth }) => {
  return (
    <>
      <Header isAuth={isAuth}/>
      <Main isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
    </>
  );
};

export default MainPage;