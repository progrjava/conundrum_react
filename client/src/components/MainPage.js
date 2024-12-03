import React from 'react';
import Header from './Header';
import Main from './Main';

const MainPage = ({ isBlackTheme, toggleTheme, isAuth }) => {
  return (
    <div>
      <Header isAuth={isAuth}/>
      <Main isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
    </div>
  );
};

export default MainPage;