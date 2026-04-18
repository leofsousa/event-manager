'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import FormField from '@/components/events/form-field';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { User } from 'lucide-react';

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
  const [ password, setPassword ] = useState('');
  const [cargo, setCargo] = useState('');
  const [cargos, setCargos] = useState<any[]>([]);
  const [role, setRole] = useState<'admin' | 'colaborador'>('colaborador');
  const [isCreateCargoOpen, setIsCreateCargoOpen] = useState(false);

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
        </h2>
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <User className="w-10 h-10 text-gray-500 dark:text-gray-300" />
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
                  onChange={(e) => { setPassword(e.target.value)}}
                />
              </FormField>
            </>
          )}

          {colaborador && (
            <FormField label="Email">
              <Input value={email} disabled />
            </FormField>
          )}

          <FormField label="Cargo">
            <Select 
              value={cargo}
              onChange={(value) => {
                if(value === "__new__") {
                  setIsCreateCargoOpen(true)
                } else {
                  setCargo(value)
                }
              }}
              options={cargoOptions}
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

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>

          <Button onClick={handleSubmit}>
            {colaborador ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
