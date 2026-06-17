'use client';

import { Moon, Sun } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);

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

    // Verificar se existe um usuário autenticado (sessão ativa vinda do callback)
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setHasSession(true);
        } else {
          setErrorMessage('Sessão de redefinição inválida ou expirada. Solicite um novo link.');
        }
      } catch (err) {
        setErrorMessage('Erro ao verificar sessão.');
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async () => {
    if (!senha || !confirmarSenha) {
      setErrorMessage('Preencha todos os campos.');
      return;
    }

    if (senha.length < 6) {
      setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas não coincidem.');
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });

      if (error) {
        setErrorMessage(error.message || 'Erro ao redefinir a senha.');
        return;
      }

      setSuccessMessage('Senha atualizada com sucesso! Redirecionando para o login...');
      
      // Desconectar o usuário por segurança
      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace('/login');
      }, 3000);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Erro ao processar solicitação.',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-sm text-gray-400">Verificando sessão...</p>
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

        <div className="text-center w-full mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-1">
            Definir Nova Senha
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
            Insira sua nova senha abaixo.
          </p>
        </div>

        {hasSession && (
          <>
            <Input
              value={senha}
              type="password"
              placeholder="Nova Senha"
              onChange={(e) => setSenha(e.target.value)}
            />

            <Input
              value={confirmarSenha}
              type="password"
              placeholder="Confirmar Nova Senha"
              onChange={(e) => setConfirmarSenha(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleResetPassword();
              }}
            />
          </>
        )}

        {errorMessage && (
          <p className="w-full text-center text-sm text-red-500">{errorMessage}</p>
        )}

        {successMessage && (
          <p className="w-full text-center text-sm text-green-600 dark:text-green-400">{successMessage}</p>
        )}

        {hasSession ? (
          <Button onClick={handleResetPassword} disabled={isUpdating} className="w-full">
            {isUpdating ? 'Salvando...' : 'Salvar Nova Senha'}
          </Button>
        ) : (
          <Button onClick={() => router.replace('/login')} className="w-full">
            Ir para o Login
          </Button>
        )}
      </div>
    </div>
  );
}
