'use client';

import { useEffect, useState } from 'react';
import TableColaboradores from '@/components/colaboradores/table-colaboradores';
import ColaboradorModal from '@/components/colaboradores/colaboradores-modal';
import { supabase } from '@/lib/supabase';


export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColaborator, setSelectedColaborator] = useState<any | null>(null)

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

  const handleDelete = async (colaborador: any) => {
    const confirmDelete = confirm(`Deletar ${colaborador.username}`);
    if (!confirmDelete) return;

    const { error } = await supabase.from('profiles').delete().eq('id', colaborador.id);

    if (error) {
      console.error(error);
      return
    }

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
        onDelete={handleDelete}
        colaboradores={colaboradores} />
      {isModalOpen && (
        <ColaboradorModal
          colaborador={selectedColaborator}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchColaboradores}
        />
      )}
    </div>
  )
}