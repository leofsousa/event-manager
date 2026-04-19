'use client';

import { useEffect, useState } from 'react';
import TableColaboradores from '@/components/colaboradores/table-colaboradores';
import ColaboradorModal from '@/components/colaboradores/colaboradores-modal';
import { supabase } from '@/lib/supabase';
import ConfirmModal from '@/components/ui/confirm-modal';

type Colaborador = {
  id: string;
  username: string;
  cargo?: string;
  role: string;
}

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColaborator, setSelectedColaborator] = useState<Colaborador | null>(null);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

  const fetchColaboradores = async () => {
    const { data, error } = await supabase.from('profiles').select('*')

    if (error) {
      console.error(error);
      return
    }
    setColaboradores(data || [])
  }
  useEffect(() => {
    fetchColaboradores()
  }, [])

  const handleEdit = (colaborador: any) => {
    setSelectedColaborator(colaborador);
    setIsModalOpen(true);
  }

  const handleDelete = async () => {
    if (!colaboradorToDelete) return;

    const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', colaboradorToDelete.id);

    if (error) {
      console.error(error);
      return
    }
    setColaboradorToDelete(null)
    fetchColaboradores()
  }
  return (
    <div className="p-4">
      <TableColaboradores
        onAdd={() => {
          setSelectedColaborator(null);
          setIsModalOpen(true);
        }}
        onEdit={handleEdit}
        onDelete={(c) => setColaboradorToDelete(c)}
        colaboradores={colaboradores} />
      {isModalOpen && (
        <ColaboradorModal
          colaborador={selectedColaborator}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchColaboradores}
        />
      )}
      {
        colaboradorToDelete && (
          <ConfirmModal 
            title="Excluir colaborador"
            description={`Tem certeza que deseja excluir ${colaboradorToDelete.username} ?`}
            onConfirm={handleDelete}
            onCancel={() => setColaboradorToDelete(null)}
          />
        )
      }
    </div>
  )
}