'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

const VALID_ROLES = ['admin', 'colaborador'] as const;
type ValidRole = typeof VALID_ROLES[number];

type AuthContextType = {
  user: any;
  role: ValidRole | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
});

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs = 10000) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error('Tempo limite ao carregar autenticação')),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<ValidRole | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    const fetchedRole = data?.role ?? null;

    if (fetchedRole && VALID_ROLES.includes(fetchedRole as ValidRole)) {
      return fetchedRole as ValidRole;
    }

    return null;
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const { data } = await withTimeout(supabase.auth.getSession());

        if (!isMounted) return;

        const currentUser = data.session?.user ?? null;

        if (currentUser) {
          const userRole = await withTimeout(fetchProfile(currentUser.id));
          if (!isMounted) return;

          setUser(currentUser);
          setRole(userRole);
        } else {
          setUser(null);
          setRole(null);
        }
      } catch (err) {
        console.error('Erro no init auth:', err);
        if (!isMounted) return;
        setUser(null);
        setRole(null);
      } finally {
        if (isMounted) setLoading(false); // 🔥 GARANTIDO
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setTimeout(async () => {
          if (!isMounted) return;

          const currentUser = session?.user ?? null;

          setLoading(true);
          setUser(currentUser);

          if (!currentUser) {
            setRole(null);
            setLoading(false);
            return;
          }

          try {
            const userRole = await withTimeout(fetchProfile(currentUser.id));
            if (!isMounted) return;
            setRole(userRole);
          } catch (err) {
            console.error('Erro ao atualizar auth:', err);
            if (!isMounted) return;
            setRole(null);
          } finally {
            if (isMounted) setLoading(false);
          }
        }, 0);
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
      if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'colaborador') {
        router.replace('/colaborador');
      }
      return;
    }

    // Validação de acesso à rota
    if (role === 'colaborador' && pathname.startsWith('/dashboard')) {
      router.replace('/colaborador');
    } else if (role === 'admin' && pathname.startsWith('/colaborador') && !pathname.startsWith('/colaborador/')) {
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
