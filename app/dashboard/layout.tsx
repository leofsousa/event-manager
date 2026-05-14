"use client";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={open} setOpen={setOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header setOpen={setOpen} />
        <main
          className="
              flex-1
              min-w-0
              overflow-auto
              overflow-x-auto
            "
        >
          <div className="p-6">{children}</div>
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
