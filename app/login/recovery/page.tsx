'use client';

import { Moon, Sun, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Recovery() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSendLink = async () => {
    if (!email) {
      setErrorMessage('Preencha seu e-mail.');
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/login/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message || 'Erro ao solicitar recuperação de senha.');
        return;
      }

      setSuccessMessage('E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.');
      setEmail('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao processar solicitação.',
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="m-4 flex w-full max-w-sm flex-col items-center justify-center gap-4 rounded-xl bg-white p-4 shadow-md dark:bg-gray-900">
        <div className="flex w-full justify-between items-center">
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
            aria-label="Voltar para o Login"
          >
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </button>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-xl bg-gray-100 p-2 text-gray-900 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            aria-label="Alternar tema"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="text-center w-full mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
            Recuperação de Senha
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
            Insira o e-mail cadastrado e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        <Input
          value={email}
          placeholder="E-mail"
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSendLink();
          }}
        />

        {errorMessage && (
          <p className="w-full text-center text-sm text-red-500">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="w-full text-center text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        )}

        <Button onClick={handleSendLink} disabled={isSending} className="w-full">
          {isSending ? 'Enviando...' : 'Enviar Link'}
        </Button>
      </div>
    </div>
  );
}
