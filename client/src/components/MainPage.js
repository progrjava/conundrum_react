import React from 'react';
import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Main from './Main';
import '../css/main.css';

const MainPage = ({ isBlackTheme, toggleTheme, isAuth }) => {
  const baseUrl = window.BASE_URL || '';

  return (
    <>
      <Helmet>
        <title>CONUNDRUM — генератор головоломок и ребусов онлайн</title>

        <meta
          name="description"
          content="CONUNDRUM — онлайн-сервис для создания, генерации и решения головоломок, ребусов и логических игр."
        />

        <link rel="canonical" href={`${baseUrl}/`} />

        {/* Open Graph */}
        <meta property="og:title" content="CONUNDRUM — генератор головоломок" />
        <meta
          property="og:description"
          content="Создавайте и решайте головоломки и ребусы онлайн с помощью CONUNDRUM."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${baseUrl}/`} />
        <meta property="og:image" content={`${baseUrl}/favicon.ico`} />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Header
        isAuth={isAuth}
        isBlackTheme={isBlackTheme}
        toggleTheme={toggleTheme}
      />
      <Main />
    </>
  );
};

export default MainPage;
