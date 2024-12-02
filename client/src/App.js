import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignInUp from './components/SignInUp';

const App = () => {
  const [isBlackTheme, setIsBlackTheme] = useState(true);

  const toggleTheme = () => {
    setIsBlackTheme(!isBlackTheme);
  };

  return (
    <Router>
      <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
        <Routes>
          <Route path="/" element={<MainPage isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} />} />
          <Route path="/register" element={<SignInUp isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

/*<div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
      <MainPage 
        isBlackTheme={isBlackTheme}
        toggleTheme={toggleTheme}
      />
    </div>*/