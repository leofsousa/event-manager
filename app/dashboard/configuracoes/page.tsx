"use client";

/* eslint-disable @next/next/no-img-element */

/* This page is accessible to any authenticated user (admin or colaborador). It now displays a friendly error message if the user is not logged in. */

/* This page is accessible to any authenticated user (admin or colaborador). It now displays a friendly error message if the user is not logged in. */

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { User } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
export default function ConfiguracoesPage() {
  const { showToast } = useToast();
  const { theme, setTheme } = useTheme();

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState('');

  // Fetch current auth user and profile data
  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setErrorMsg('Usuário não autenticado');
        setLoading(false);
        return;
      }
      setUserId(user.id);
      setEmail(user.email ?? '');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, avatar_url, role')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setUsername(profile?.username ?? '');
      setAvatarUrl(profile?.avatar_url ?? '');
      setUserRole(profile?.role ?? null);
    } catch (err) {
      console.error(err);
      setErrorMsg('Erro ao carregar perfil');
      showToast('Erro ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      const file = e.target.files[0];
      const ext = file.name.split('.').pop();
      const fileName = `${Math.round(Math.random() * 1e9)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      setAvatarUrl(publicUrl);
      // Persist the avatar URL to the user's profile so it survives page reloads
      if (userId) {
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', userId);
        if (profileUpdateError) {
          console.error('Failed to update avatar URL in profile:', profileUpdateError);
          showToast('Erro ao salvar foto no perfil');
        } else {
          showToast('Foto atualizada e salva no perfil');
        }
      } else {
        // If userId is not yet set, just show the toast; profile will be updated on save
        showToast('Foto atualizada');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao fazer upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;
    if (newPassword && newPassword !== confirmPassword) {
      showToast('As senhas não coincidem');
      return;
    }
    try {
      // Update profile info
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ username, avatar_url: avatarUrl || null })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Update password if provided
      if (newPassword) {
        const { error: pwdError } = await supabase.auth.updateUser({ password: newPassword });
        if (pwdError) throw pwdError;
      }

      showToast('Perfil atualizado com sucesso');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar alterações');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500 dark:text-gray-400">Carregando...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <p className="text-red-600 dark:text-red-400">{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Configurações da Conta</h1>

      {/* Avatar Section */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <label className="cursor-pointer bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-950/50">
          {uploading ? 'Enviando...' : 'Alterar Foto'}
          <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
        </label>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Responsive grid for name and email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Seu nome" className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E‑mail</label>
            <Input value={email} disabled className="bg-gray-100 dark:bg-gray-800 w-full" />
          </div>
        </div>
        <hr className="border-gray-200 dark:border-gray-700" />
        <h2 className="text-lg font-medium mt-4 mb-2 text-gray-900 dark:text-white">Alterar Senha</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nova Senha</label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha</label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme a senha" className="w-full" />
        </div>
        
        {/* Theme selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tema da aplicação</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
          >
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>

        {/* Export button – visible only for admin */}
        {userRole === 'admin' && (
          <div className="flex justify-end mb-4">
            <button
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => setExportModalOpen(true)}
            >
              Exportar Agenda
            </button>
          </div>
        )}

        {/* Export Modal */}
        {isExportModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
              <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Selecionar Mês para Exportar</h2>
              <input
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="w-full p-2 border rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                  onClick={() => setExportModalOpen(false)}
                >Cancelar</button>
                <button
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                  onClick={async () => {
                    if (!exportMonth) {
                      showToast('Selecione um mês');
                      return;
                    }
                    try {
                      const res = await fetch(`/api/export-agenda?month=${exportMonth}`);
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error || 'Erro ao exportar');
                      }
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `agenda-${exportMonth}.xlsx`;
                      a.click();
                      URL.revokeObjectURL(url);
                      showToast('Exportação concluída');
                      setExportModalOpen(false);
                    } catch (e: any) {
                      console.error(e);
                      showToast(e.message ?? 'Erro na exportação');
                    }
                  }}
                >Exportar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6 gap-3">
        <Button variant="secondary" onClick={() => fetchProfile()}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  );
}
