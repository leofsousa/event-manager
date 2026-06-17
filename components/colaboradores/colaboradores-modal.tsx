'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import FormField from '@/components/events/form-field';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';
import CreateOptionModal from '@/components/modals/create-option-modal';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
  colaborador?: any;
};

export default function ColaboradorModal({
  onClose,
  onSuccess,
  colaborador,
}: Props) {
  const { showToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargos, setCargos] = useState<any[]>([]);
  const [role, setRole] = useState<'admin' | 'colaborador'>('colaborador');
  const [isCreateCargoOpen, setIsCreateCargoOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // States for resetting password
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const cargoOptions = cargos.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  useEffect(() => {
    if (colaborador) {
      setUsername(colaborador.username);
      setCargo(colaborador.cargo || '');
      setRole(colaborador.role);
      setEmail(colaborador.email || '');
      setAvatarUrl(colaborador.avatar_url || '');
    }
  }, [colaborador]);

  const fetchCargos = async () => {
    const { data, error } = await supabase.from('cargos').select('*');

    if (error) {
      console.error(error);
      return;
    }

    setCargos(data || []);
  };

  useEffect(() => {
    fetchCargos();
  }, []);

  const handleCreateCargo = async (name: string) => {
    const { error } = await supabase.from('cargos').insert([{ name }]);

    if (error) {
      console.error(error);
      showToast('Erro ao criar cargo');
      return;
    }

    await fetchCargos();
    setCargo(name);
    showToast('Cargo criado!');
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.round(Math.random() * 1e9)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      showToast('Foto carregada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro no upload. Certifique-se de que o bucket público "avatars" existe no Supabase.');
    } finally {
      setUploading(false);
    }
  };

  const handleResetPasswordAdmin = async () => {
    if (newPassword.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsResettingPassword(true);
      const res = await fetch('/api/reset-user-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: colaborador.id,
          password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao redefinir a senha');
      }

      showToast('Senha alterada com sucesso!');
      setNewPassword('');
      setShowResetPassword(false);
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : 'Erro ao redefinir a senha');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      showToast('Nome é obrigatório');
      return;
    }

    if (!colaborador && password.length < 6) {
      showToast('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      if (colaborador) {
        const { error } = await supabase
          .from('profiles')
          .update({
            username,
            cargo,
            role,
            avatar_url: avatarUrl || null,
          })
          .eq('id', colaborador.id);

        if (error) throw error;

        showToast('Colaborador atualizado!');
      } else {
        const res = await fetch('/api/create-user', {
          method: 'POST',
          body: JSON.stringify({
            username,
            email,
            password,
            cargo,
            role,
            avatar_url: avatarUrl || null,
          }),
        });

        if (!res.ok) throw new Error();

        showToast('Colaborador criado!');
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </h2>
        
        {/* Photo Upload and Preview Section */}
        <div className="flex flex-col items-center gap-3 mb-5 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div className="relative w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600 shadow-sm">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-gray-500 dark:text-gray-300" />
            )}
          </div>
          <div className="flex flex-col items-center gap-1.5 w-full">
            <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-500 cursor-pointer bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 transition">
              {uploading ? 'Enviando...' : 'Fazer upload de foto'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-[10px] text-gray-400 text-center">ou informe um link da foto abaixo</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <FormField label="Nome" required>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormField>

          {!colaborador && (
            <>
              <FormField label="Email" required>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>

              <FormField label="Senha" required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value) }}
                />
              </FormField>
            </>
          )}

          {colaborador && (
            <FormField label="Email">
              <Input value={email} disabled />
            </FormField>
          )}

          {colaborador && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900/30 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Senha do Colaborador
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(!showResetPassword);
                    setNewPassword('');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  {showResetPassword ? 'Cancelar' : 'Alterar Senha'}
                </button>
              </div>

              {showResetPassword && (
                <div className="flex flex-col gap-2 mt-1">
                  <Input
                    type="password"
                    placeholder="Nova senha (mínimo 6 caracteres)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={handleResetPasswordAdmin}
                    disabled={isResettingPassword}
                    className="w-full text-xs py-1.5"
                  >
                    {isResettingPassword ? 'Alterando...' : 'Confirmar Nova Senha'}
                  </Button>
                </div>
              )}
            </div>
          )}

          <FormField label="Link da Foto (URL)">
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </FormField>

          <FormField label="Cargo">
            <Select
              value={cargo}
              onChange={(value) => {
                if (value === "__new__") {
                  setIsCreateCargoOpen(true)
                } else {
                  setCargo(value)
                }
              }}
              options={cargoOptions}
              showCreateOption
              createOptionLabel="Adicionar Cargo"
            />
          </FormField>

          <FormField label="Perfil">
            <Select
              value={role}
              onChange={(value) => setRole(value as any)}
              options={[
                { label: 'Colaborador', value: 'colaborador' },
                { label: 'Admin', value: 'admin' },
              ]}
              placeholder="Selecione o perfil"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>

          <Button onClick={handleSubmit}>
            {colaborador ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </div>
      {isCreateCargoOpen && (
      <CreateOptionModal
        title="Novo cargo"
        placeholder="Ex: Diretor"
        onClose={() => setIsCreateCargoOpen(false)}
        onCreate={(value) => {
          handleCreateCargo(value);
          setIsCreateCargoOpen(false);
        }}
      />
    )}
    </div>
  );
}
