import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import React from 'react';
import Welcome from './Welcome';
import Home from './Home';
import Modules from './Modules';
import Support from './Support';
import Layout from './Layout';
import Admin from './Admin';
import { ThemeContext } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <LanguageProvider>
      <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/admin" element={<Admin />} />
            <Route element={<Layout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/modules" element={<Modules />} />
              <Route path="/support" element={<Support />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </LanguageProvider>
  );
}

export default App;
