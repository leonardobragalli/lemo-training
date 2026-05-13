import { createContext, useContext, useState } from 'react';
import { translations } from './i18n/translations';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('lemo_lang') || 'it');

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem('lemo_lang', code);
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
