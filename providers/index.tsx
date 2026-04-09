"use client";

import { ToastProvider } from "@/components/ui/toast-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
