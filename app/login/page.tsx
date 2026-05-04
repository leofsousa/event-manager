'use client';

import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

export default function Login() {
  const { loading } = useAuth();
  const router = useRouter();
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
    console.log('1. handleLogin iniciado');

    if (!email || !senha) {
      alert('Preencha corretamente os campos');
      return;
    }

    console.log('2. Campos validados');
    setIsLoggingIn(true);

    try {
      console.log('3. Iniciando requisição para /api/auth/login');
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: senha }),
      });

      console.log('4. Resposta recebida:', response.status);
      const data = await response.json();
      console.log('5. Dados parseados:', data);

      if (!response.ok) {
        console.log('6. Erro na resposta:', data.error);
        alert(data.error || 'Erro ao fazer login');
        setIsLoggingIn(false);
        return;
      }

      console.log('7. Login da API bem-sucedido, agora chamando Supabase client');
      const { data: clientData, error: clientError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (clientError) {
        console.error('8. Erro no signInWithPassword do client:', clientError);
        alert(clientError.message || 'Erro ao autenticar o cliente');
        setIsLoggingIn(false);
        return;
      }

      console.log('9. login client bem-sucedido', clientData);

      const role = data.role;
      if (role === 'admin') {
        router.replace('/dashboard');
      } else if (role === 'colaborador') {
        router.replace('/colaborador');
      } else {
        console.warn('Role retornada inválida:', role);
        router.replace('/login');
      }

      setIsLoggingIn(false);
    } catch (error) {
      console.error('10. ERRO na requisição:', error);
      alert('Erro ao fazer login: ' + (error instanceof Error ? error.message : String(error)));
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