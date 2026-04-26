'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HeaderColaborador({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) {
  const pathName = usePathname();

  const getTitle = () => {
    if (pathName.startsWith('/colaborador/settings')) {
      return 'Configurações';
    }
    return 'Agenda';
  };

  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');

    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(theme);

    if (theme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <header className="h-16 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 flex justify-between items-center">
      <div className="flex items-center gap-5">
        <button
          className="rounded-2xl md:hidden hover:bg-blue-200 dark:hover:bg-blue-700 transition p-2 text-gray-900 dark:text-white"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>

        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {getTitle()}
        </h1>
      </div>

      <div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-900 dark:text-white"
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>
    </header>
  );
}