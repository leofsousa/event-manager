import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  // Load saved theme from localStorage on mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') as Theme | null : null;
    if (saved) {
      setTheme(saved);
    }
  }, []);

  // Apply theme to document.documentElement
  useEffect(() => {
    const root = document.documentElement;
    const remove = () => {
      root.classList.remove('light', 'dark');
    };
    remove();
    if (theme === 'light') {
      root.classList.add('light');
    } else if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      // system: follow prefers-color-scheme
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches);
        root.classList.toggle('light', !e.matches);
      };
      root.classList.toggle('dark', media.matches);
      root.classList.toggle('light', !media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    // Persist theme choice
    if (theme !== 'system') {
      localStorage.setItem('theme', theme);
    } else {
      localStorage.removeItem('theme');
    }
  }, [theme]);

  return { theme, setTheme } as const;
}
