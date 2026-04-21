'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EventShiftsManager from '@/components/events/event-shift-manager';
import Button from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';

type Shift = {
  id?: string;
  start_time: string;
  end_time: string;
  colaboradores: string[];
};

export default function EventEscalaPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [event, setEvent] = useState<any>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      showToast('Erro ao carregar evento');
      return;
    }

    setEvent(data);
  };

  const fetchShifts = async () => {
    const { data, error } = await supabase
      .from('event_shifts')
      .select(`
        id,
        start_time,
        end_time,
        event_shift_collaborators (
          collaborator_id
        )
      `)
      .eq('event_id', id);

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((shift: any) => ({
      id: shift.id,
      start_time: shift.start_time,
      end_time: shift.end_time,
      colaboradores: shift.event_shift_collaborators.map(
        (c: any) => c.collaborator_id
      ),
    }));

    setShifts(formatted);
  };

  useEffect(() => {
    const load = async () => {
      await fetchEvent();
      await fetchShifts();
      setIsLoading(false);
    };

    load();
  }, []);

  const handleSave = async () => {
    try {
      await supabase
        .from('event_shifts')
        .delete()
        .eq('event_id', id);

      for (const shift of shifts) {
        const { data: newShift, error } = await supabase
          .from('event_shifts')
          .insert([{
            event_id: id,
            start_time: shift.start_time,
            end_time: shift.end_time,
          }])
          .select()
          .single();

        if (error) throw error;

        if (shift.colaboradores.length > 0) {
          await supabase
            .from('event_shift_collaborators')
            .insert(
              shift.colaboradores.map((colabId) => ({
                shift_id: newShift.id,
                collaborator_id: colabId,
              }))
            );
        }
      }

      showToast('Escala salva com sucesso!');
      router.push('/dashboard/eventos');

    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar escala');
    }
  };

  if (isLoading) return <p>Carregando...</p>;
  if (!event) return <p>Evento não encontrado</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">

      <div>
        <h1 className="text-2xl font-semibold">
          {event.nome}
        </h1>

        <p className="text-sm text-gray-500">
          {event.data} • {event.local}
        </p>
      </div>

      <EventShiftsManager
        shifts={shifts}
        setShifts={setShifts}
      />

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => router.back()}>
          Voltar
        </Button>

        <Button onClick={handleSave}>
          Salvar escala
        </Button>
      </div>

    </div>
  );
}
