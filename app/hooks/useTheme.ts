import { useState, useEffect } from 'react';

type Theme = 'system' | 'light' | 'dark';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>('system');

  // Initialize from localStorage or system preference
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (stored === 'light' || stored === 'dark') {
      setTheme(stored);
    } else {
      setTheme('system');
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      // Apply dark class for dark mode
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (newTheme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // system – follow OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }
  };

  return { theme, setTheme: updateTheme };
};
