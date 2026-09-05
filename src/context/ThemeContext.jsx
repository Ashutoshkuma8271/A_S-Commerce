import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

const ThemeContext = createContext(null);

/**
 * Resolves the collision-free persistent theme storage key based on current route and authenticated email
 */
const getStorageKey = (pathname) => {
  const isAdmin = pathname ? pathname.toLowerCase().startsWith('/admin') : false;
  if (isAdmin) {
    try {
      const adminProfile = JSON.parse(localStorage.getItem('as_admin_profile') || '{}');
      const email = adminProfile?.email ? adminProfile.email.toLowerCase().trim() : '';
      const emailKey = email ? encodeURIComponent(email) : 'master';
      return `as_theme_admin_${emailKey}`;
    } catch (e) {
      return 'as_theme_admin_master';
    }
  } else {
    try {
      const userProfile = JSON.parse(localStorage.getItem('as_commerce_user') || '{}');
      const email = userProfile?.email ? userProfile.email.toLowerCase().trim() : '';
      const emailKey = email ? encodeURIComponent(email) : 'guest';
      return `as_theme_user_${emailKey}`;
    } catch (e) {
      return 'as_theme_user_guest';
    }
  }
};

const getStoredTheme = (storageKey, defaultTheme = 'light') => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved === 'dark' || saved === 'light') return saved;

    // Apply legacy shared value and migrate into scoped account key
    if (storageKey === 'as_theme_admin_master') {
      const legacyAdmin = localStorage.getItem('as_theme_admin');
      if (legacyAdmin === 'dark' || legacyAdmin === 'light') {
        try { localStorage.setItem(storageKey, legacyAdmin); } catch (e) {}
        return legacyAdmin;
      }
    } else if (storageKey === 'as_theme_user_guest') {
      const legacyUser = localStorage.getItem('as_theme_preference');
      if (legacyUser === 'dark' || legacyUser === 'light') {
        try { localStorage.setItem(storageKey, legacyUser); } catch (e) {}
        return legacyUser;
      }
    } else {
      // Check legacy shared value for account migration
      const legacyKey = storageKey.startsWith('as_theme_admin_') ? 'as_theme_admin' : 'as_theme_preference';
      const legacyVal = localStorage.getItem(legacyKey);
      if (legacyVal === 'dark' || legacyVal === 'light') {
        try { localStorage.setItem(storageKey, legacyVal); } catch (e) {}
        return legacyVal;
      }
    }

    return defaultTheme;
  } catch (e) {
    return defaultTheme;
  }
};

export const ThemeProvider = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.toLowerCase().startsWith('/admin');

  // Track user & admin themes separately so they never overwrite each other
  const [userTheme, setUserTheme] = useState(() => {
    return getStoredTheme(getStorageKey('/'), 'light');
  });

  const [adminTheme, setAdminTheme] = useState(() => {
    return getStoredTheme(getStorageKey('/admin'), 'light');
  });

  // Active theme is resolved based on the active route
  const currentTheme = isAdminRoute ? adminTheme : userTheme;

  // Apply DOM classes whenever route or active theme changes
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    const active = isAdminRoute ? adminTheme : userTheme;

    if (active === 'dark') {
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
  }, [isAdminRoute, adminTheme, userTheme]);

  // Sync on location change to read latest account-specific storage key if user logged in/out
  useEffect(() => {
    const key = getStorageKey(location.pathname);
    const stored = getStoredTheme(key, 'light');
    if (isAdminRoute) {
      if (stored !== adminTheme) setAdminTheme(stored);
    } else {
      if (stored !== userTheme) setUserTheme(stored);
    }
  }, [location.pathname, isAdminRoute]);

  const toggleTheme = useCallback(() => {
    if (isAdminRoute) {
      setAdminTheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark';
        const key = getStorageKey('/admin');
        try {
          localStorage.setItem(key, next);
        } catch (e) {}
        return next;
      });
    } else {
      setUserTheme((prev) => {
        const next = prev === 'dark' ? 'light' : 'dark';
        const key = getStorageKey('/');
        try {
          localStorage.setItem(key, next);
        } catch (e) {}
        return next;
      });
    }
  }, [isAdminRoute]);

  const setTheme = useCallback((newTheme) => {
    if (newTheme !== 'dark' && newTheme !== 'light') return;
    if (isAdminRoute) {
      setAdminTheme(newTheme);
      const key = getStorageKey('/admin');
      try {
        localStorage.setItem(key, newTheme);
      } catch (e) {}
    } else {
      setUserTheme(newTheme);
      const key = getStorageKey('/');
      try {
        localStorage.setItem(key, newTheme);
      } catch (e) {}
    }
  }, [isAdminRoute]);

  const contextValue = useMemo(() => ({
    theme: currentTheme,
    isDark: currentTheme === 'dark',
    toggleTheme,
    setTheme,
    isAdminRoute,
    userTheme,
    adminTheme,
  }), [currentTheme, toggleTheme, setTheme, isAdminRoute, userTheme, adminTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
