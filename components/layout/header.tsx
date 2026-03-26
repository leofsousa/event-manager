'use client';

import { Menu, Moon, Sun } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState} from 'react';

export default function Header({
  setOpen,
}: {
  setOpen: (value: boolean) => void;
}) {
  const pathName = usePathname();
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/eventos': 'Eventos',
    '/dashboard/colaboradores': 'Colaboradores',
    '/dashboard/settings': 'Configurações',
  };
const [isDark, setIsDark] = useState(false);
const toggleTheme = () => {
  const newTheme = !isDark;
  setIsDark(newTheme);
  if (newTheme) {
    document.documentElement.classList.add("dark")
  } else {
    document.documentElement.classList.remove("dark")
  }
}

  return (
    <header className="h-16 w-full bg-white border-b px-4 flex justify-between items-center ">
      <div className="flex items-center gap-5">
        <button
          className="rounded-2xl md:hidden hover:bg-blue-200 transition p-2 dark:text-gray-900"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {titles[pathName] || 'Dashboard'}
        </h1>
      </div>
      <div>
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-200 hover:bg-blue-600 transition dark:text-gray-900">
          {isDark ? <Sun size={20} /> :  <Moon size={20}/>
          }
        </button>
      </div>
    </header>
  );
}
