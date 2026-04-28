'use client';

import { Home, Calendar, Users, Settings, LogOut, Navigation } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Props = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

export default function Sidebar({ open, setOpen }: Props) {
  const router = useRouter();
  const pathName = usePathname();
  const [profile, setProfile] = useState<{ username: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setProfile({
        username: data?.username ?? '',
        email: user.email ?? '',
      });
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const menuItem = (label: string, icon: any, path: string) => {
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
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Event Manager
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ul className="flex flex-col gap-2">
          {menuItem('Agenda', Home, '/dashboard')}
          {menuItem('Eventos', Calendar, '/dashboard/eventos')}
          {menuItem('Viagens', Navigation, '/dashboard/viagens')}
          {menuItem('Colaboradores', Users, '/dashboard/colaboradores')}
          {menuItem('Configurações', Settings, '/dashboard/settings')}
        </ul>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">

        {/* USUÁRIO LOGADO */}
        {profile && (
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {profile.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {profile.email}
              </p>
            </div>
          </div>
        )}

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