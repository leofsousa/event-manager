'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute='class' enableSystem={true} defaultTheme='system'>
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
