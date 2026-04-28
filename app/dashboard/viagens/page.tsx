'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
  observacoes?: string;
};

export default function ViagensPage() {
  const router = useRouter();
  const [viagens, setViagens] = useState<Viagem[]>([]);

  const fetchViagens = async () => {
    const { data, error } = await supabase
      .from('viagens')
      .select('*')
      .order('data_saida', { ascending: true });

    if (error) { console.error(error); return; }
    setViagens(data || []);
  };

  useEffect(() => { fetchViagens(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('viagens').delete().eq('id', id);
    if (error) { console.error(error); return; }
    setViagens((prev) => prev.filter((v) => v.id !== id));
  };

  const formatDate = (date: string) =>
    format(new Date(date + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Viagens
        </h1>
        <Button onClick={() => router.push('/dashboard/viagens/nova')}>
          + Nova Viagem
        </Button>
      </div>

      {viagens.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-500">
          Nenhuma viagem cadastrada ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {viagens.map((viagem) => (
            <div
              key={viagem.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  {viagem.nome}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  🚐 {formatDate(viagem.data_saida)} → {formatDate(viagem.data_retorno)}
                </p>
                {viagem.observacoes && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {viagem.observacoes}
                  </p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/dashboard/viagens/${viagem.id}`)}
                >
                  Detalhes
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(viagem.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}