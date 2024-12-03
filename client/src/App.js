import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import SignInUp from './components/SignInUp';
import PersonalAccount from './components/PersonalAccount';
import axios from 'axios';

const App = () => {
  const [isBlackTheme, setIsBlackTheme] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  const toggleTheme = () => {
    setIsBlackTheme(!isBlackTheme);
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/profile');
        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  return (
    <Router>
      <div className={isBlackTheme ? 'black-theme' : 'white-theme'}>
        <Routes>
          <Route path="/" element={<MainPage isBlackTheme={isBlackTheme} toggleTheme={toggleTheme} isAuth={isAuth}/>} />
          <Route path="/register" element={ !isAuth ?
            <SignInUp 
              isBlackTheme={isBlackTheme} 
              toggleTheme={toggleTheme}
              isAuth={isAuth} 
              setIsAuth={setIsAuth}/> : 
              <Navigate to="/account" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/logout" element={<Navigate to="/" replace />} />
          <Route path='/account' element={ isAuth ?
            <PersonalAccount 
              isBlackTheme={isBlackTheme} 
              toggleTheme={toggleTheme}
              isAuth={isAuth} 
              setIsAuth={setIsAuth} /> :
              <Navigate to="/register" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
