'use client';

import SidebarColaborador from '@/components/colaboradores/sidebar-colaborador';
import HeaderColaborador from '@/components/colaboradores/header-colaborador';
import { useState } from 'react';

export default function ColaboradorLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <SidebarColaborador open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col">
        <HeaderColaborador setOpen={setOpen} />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}