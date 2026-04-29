'use client';

import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

export default function Login() {
  const { loading } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
      alert('Preencha corretamente os campos');
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Erro ao fazer login');
        setIsLoggingIn(false);
        return;
      }

      // Sincroniza sessão no client — onAuthStateChange dispara e auth-context redireciona
      await supabase.auth.signInWithPassword({ email, password: senha });

    } catch (error) {
      console.error(error);
      alert('Erro ao fazer login');
      setIsLoggingIn(false);
    }
  };

  // Mostra loading enquanto verifica sessão inicial
  if (loading) {
    return (
      <div className="h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="flex flex-col w-full max-w-sm p-4 m-4 items-center justify-center bg-white dark:bg-gray-900 rounded-xl gap-4 shadow-md space-y-3">
        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl p-2 bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 transition"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <h1 className="text-center w-full text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">
          Event Manager
        </h1>

        <Input
          value={email}
          placeholder="Login"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          value={senha}
          type="password"
          placeholder="Senha"
          onChange={(e) => setSenha(e.target.value)}
        />

        <Button onClick={handleLogin} disabled={isLoggingIn}>
          {isLoggingIn ? 'Entrando...' : 'Entrar'}
        </Button>
      </div>
    </div>
  );
}