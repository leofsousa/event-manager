'use client';

import { Home, Calendar, Users, Settings, LogOut } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function Sidebar({ open, setOpen }: Props) {
  const router = useRouter();
  const pathName = usePathname();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const menuItem = (
    label: string,
    icon: any,
    path: string
  ) => {
    const Icon = icon;

    const isActive = pathName === path;

    return (
      <li
        onClick={() => {
          router.push(path);
          setOpen(false);
        }}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
          ${isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
            : 'text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-700'}
        `}
      >
        <Icon size={20} />
        <span>{label}</span>
      </li>
    );
  };

  return (
    <aside
      className={`
        w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        fixed top-0 left-0 z-50 transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
        flex flex-col
      `}
    >
      {/* HEADER */}
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Event Manager
        </h1>
      </div>

      {/* MENU (SCROLLÁVEL) */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="flex flex-col gap-2">
          {menuItem('Dashboard', Home, '/dashboard')}
          {menuItem('Eventos', Calendar, '/dashboard/eventos')}
          {menuItem('Colaboradores', Users, '/dashboard/colaboradores')}
          {menuItem('Configurações', Settings, '/dashboard/settings')}
        </ul>
      </div>

      {/* FOOTER FIXO */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg
          text-gray-700 dark:text-gray-200
          hover:bg-red-500 hover:text-white transition"
        >
          <LogOut size={20} />
          Sair
        </button>
      </div>
    </aside>
  );
}
