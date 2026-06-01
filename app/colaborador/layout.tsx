'use client';

import SidebarColaborador from '@/components/colaboradores/sidebar-colaborador';
import HeaderColaborador from '@/components/colaboradores/header-colaborador';
import { useState } from 'react';

export default function ColaboradorLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <SidebarColaborador open={open} setOpen={setOpen} />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderColaborador setOpen={setOpen} />
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-slate-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
