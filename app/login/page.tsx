'use client';

import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

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

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace('/dashboard');
    }
  }, [user, loading]);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async () => {
    if (!email || !senha) {
      alert('Preencha corretamente os campos')
      return
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (error) {
      console.error(error);
      alert("Erro ao fazer login");
      return;
    }
    router.push('/dashboard')
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
        <Button children="Entrar" onClick={handleLogin} />
      </div>
    </div>
  );
}
