"use client";

import { ToastProvider } from "@/components/ui/toast-context";
import { AuthProvider } from '@/context/auth-context';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
}
