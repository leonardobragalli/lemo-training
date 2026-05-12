import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import React from 'react';
import Welcome from './Welcome';
import Home from './Home';
import Modules from './Modules';
import Support from './Support';
import Layout from './Layout';
import Admin from './Admin';
import { ThemeContext } from './ThemeContext';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Welcome />} />
        <Route path="/admin" element={<Admin />} />
        
        {/* Pagine con la Sidebar */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/modules" element={<Modules />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

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
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

export default App;