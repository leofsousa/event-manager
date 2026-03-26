'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

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
  return (
    <header className="h-16 w-full bg-white border-b px-4 flex justify-between items-center ">
      <div className="flex items-center gap-5">
        <button
          className="rounded-2xl md:hidden hover:bg-blue-200 transition p-2"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">
          {titles[pathName] || 'Dashboard'}
        </h1>
      </div>
    </header>
  );
}
