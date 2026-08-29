import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = 'as_theme_preference';

export const ThemeProvider = ({ children }) => {
  // Default to 'light' (Bright Mode) as requested
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return saved === 'dark' ? 'dark' : 'light';
    } catch (e) {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
      body.classList.remove('bg-cream-100', 'text-brand-dark');
      body.classList.add('bg-navy-950', 'text-gray-100');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      body.classList.remove('bg-navy-950', 'text-gray-100');
      body.classList.add('bg-cream-100', 'text-brand-dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {}
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
