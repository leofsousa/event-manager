'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

type AuthContextType = {
  user: any;
  role: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return data?.role ?? null;
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted) return;

      const currentUser = data.session?.user ?? null;

      if (currentUser) {
        const userRole = await fetchProfile(currentUser.id);
        setUser(currentUser);
        setRole(userRole);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;

        setUser(currentUser);

        if (currentUser) {
          const userRole = await fetchProfile(currentUser.id);
          setRole(userRole);
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user && !pathname.startsWith('/login')) {
      router.replace('/login');
      return;
    }

    if (!user) return;

    if (pathname.startsWith('/login')) {
      if (role === 'admin') router.replace('/dashboard');
      if (role === 'colaborador') router.replace('/colaborador');
      return;
    }

    if (role === 'colaborador' && pathname.startsWith('/dashboard')) {
      router.replace('/colaborador');
    }

    if (role === 'admin' && pathname.startsWith('/colaborador')) {
      router.replace('/dashboard');
    }
  }, [role, loading, pathname, user, router]);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
