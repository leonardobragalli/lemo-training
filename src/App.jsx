import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import React from 'react';
import Layout from './Layout';
import { ThemeContext } from './ThemeContext';
import { LanguageProvider } from './LanguageContext';

const Welcome = lazy(() => import('./Welcome'));
const Home    = lazy(() => import('./Home'));
const Modules = lazy(() => import('./Modules'));
const Support = lazy(() => import('./Support'));
const Admin   = lazy(() => import('./Admin'));

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (window.__hideSplash) window.__hideSplash();
  }, []);

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
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Welcome />} />
              <Route path="/admin" element={<Admin />} />
              <Route element={<Layout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/modules" element={<Modules />} />
                <Route path="/support" element={<Support />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ThemeContext.Provider>
    </LanguageProvider>
  );
}

export default App;
