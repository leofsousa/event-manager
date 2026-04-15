'use client';

import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

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
    <div className="h-screen w-full bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col w-full max-w-sm p-2 m-4 items-center justify-center bg-white rounded-xl gap-2 shadow-md space-y-3">
        <h1 className="text-center text-2xl font-bold text-gray-900 dark:text-blue-600 tracking-tight mb-6">
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
