'use client';

import Sidebar from '@/components/layout/sidebar';
import Button from '@/components/ui/button';
import { useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    const user = localStorage.getItem('user');

    if (!user) {
      window.location.href = '/login';
    }
  }, []);

  

  return (
    <div>
      
    </div>
  );
}
