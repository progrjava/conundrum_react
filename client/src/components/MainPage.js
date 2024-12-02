import React from 'react';
import Header from './Header';
import Main from './Main';

const MainPage = ({ isBlackTheme, toggleTheme }) => {
  return (
    <div>
      <Header/>
      <Main isBlackTheme={isBlackTheme} toggleTheme={toggleTheme}/>
    </div>
  );
};

export default MainPage;