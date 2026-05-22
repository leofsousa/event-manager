'use client';

import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

const VALID_ROLES = ['admin', 'colaborador'] as const;

export default function Login() {
  const { loading } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(theme);
    if (theme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErrorMessage('Preencha email e senha.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage(null);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: senha,
        });

      if (authError) {
        setErrorMessage(authError.message || 'Credenciais inválidas.');
        return;
      }

      if (!authData.user) {
        setErrorMessage('Não foi possível autenticar o usuário.');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile?.role) {
        await supabase.auth.signOut();
        setErrorMessage('Perfil do usuário não encontrado.');
        return;
      }

      if (!VALID_ROLES.includes(profile.role as (typeof VALID_ROLES)[number])) {
        await supabase.auth.signOut();
        setErrorMessage('Perfil sem permissão de acesso.');
        return;
      }

      router.refresh();

      if (profile.role === 'admin') {
        router.replace('/dashboard');
      } else {
        router.replace('/colaborador');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao fazer login.',
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-400">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="m-4 flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900">
        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl bg-gray-100 p-2 text-gray-900 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <h1 className="mb-2 w-full text-center text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Event Manager
        </h1>

        <Input
          value={email}
          placeholder="Email"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          value={senha}
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleLogin();
          }}
        />

        {errorMessage && (
          <p className="w-full text-center text-sm text-red-500">{errorMessage}</p>
        )}

        <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full">
          {isLoggingIn ? 'Entrando...' : 'Entrar'}
        </Button>
      </div>
    </div>
  );
}
