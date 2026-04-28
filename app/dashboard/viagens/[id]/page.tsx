'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Event } from '@/types/type-event';
import EventShiftsManager from '@/components/events/event-shift-manager';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
  observacoes?: string;
};

type Shift = {
  id?: string;
  start_time: string;
  end_time: string;
  colaboradores: string[];
};

export default function ViagemDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isSavingScale, setIsSavingScale] = useState(false);

  const formatDate = (date: string) =>
    format(new Date(date + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR });

  const fetchViagem = async () => {
    const { data, error } = await supabase
      .from('viagens')
      .select('*')
      .eq('id', id)
      .single();

    if (error) { console.error(error); return; }
    setViagem(data);
  };

  const fetchEventos = async () => {
    // Eventos já vinculados à viagem
    const { data, error } = await supabase
      .from('events')
      .select('*, channels(sigla)')
      .eq('viagem_id', id)
      .order('data', { ascending: true });

    if (error) { console.error(error); return; }
    setEventos(data || []);
  };

  const fetchAllEvents = async () => {
    // Eventos sem viagem para vincular
    const { data, error } = await supabase
      .from('events')
      .select('*, channels(sigla)')
      .is('viagem_id', null)
      .order('data', { ascending: true });

    if (error) { console.error(error); return; }
    setAllEvents(data || []);
  };

  const fetchShifts = async () => {
    if (eventos.length === 0) return;

    const { data, error } = await supabase
      .from('event_shifts')
      .select('*, event_shift_collaborators(collaborator_id)')
      .eq('event_id', eventos[0].id);

    if (error) { console.error(error); return; }

    const mapped = (data || []).map((s: any) => ({
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
      colaboradores: s.event_shift_collaborators.map((c: any) => c.collaborator_id),
    }));

    setShifts(mapped);
  };

  useEffect(() => {
    fetchViagem();
    fetchEventos();
    fetchAllEvents();
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [eventos]);

  const handleVincularEvento = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .update({ viagem_id: id })
      .eq('id', eventId);

    if (error) { showToast('Erro ao vincular evento'); return; }

    await fetchEventos();
    await fetchAllEvents();
    showToast('Evento vinculado!');
  };

  const handleDesvincularEvento = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .update({ viagem_id: null })
      .eq('id', eventId);

    if (error) { showToast('Erro ao desvincular evento'); return; }

    await fetchEventos();
    await fetchAllEvents();
    showToast('Evento desvinculado!');
  };

  const handleSaveScale = async () => {
    if (eventos.length === 0) {
      showToast('Adicione eventos antes de salvar a escala');
      return;
    }

    setIsSavingScale(true);

    try {
      // Replica a escala para todos os eventos da viagem
      for (const evento of eventos) {
        // Remove shifts antigos do evento
        const { data: oldShifts } = await supabase
          .from('event_shifts')
          .select('id')
          .eq('event_id', evento.id);

        if (oldShifts && oldShifts.length > 0) {
          const oldIds = oldShifts.map((s: any) => s.id);

          await supabase
            .from('event_shift_collaborators')
            .delete()
            .in('shift_id', oldIds);

          await supabase
            .from('event_shifts')
            .delete()
            .eq('event_id', evento.id);
        }

        // Insere novos shifts
        for (const shift of shifts) {
          const { data: newShift, error: shiftError } = await supabase
            .from('event_shifts')
            .insert([{
              event_id: evento.id,
              start_time: shift.start_time,
              end_time: shift.end_time,
            }])
            .select()
            .single();

          if (shiftError) throw shiftError;

          if (shift.colaboradores.length > 0) {
            const collaborators = shift.colaboradores.map((colabId) => ({
              shift_id: newShift.id,
              collaborator_id: colabId,
            }));

            const { error: collabError } = await supabase
              .from('event_shift_collaborators')
              .insert(collaborators);

            if (collabError) throw collabError;
          }
        }
      }

      showToast('Escala salva e replicada para todos os eventos!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar escala');
    }

    setIsSavingScale(false);
  };

  if (!viagem) return <p className="p-6">Carregando...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto flex flex-col gap-8">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            {viagem.nome}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            🚐 {formatDate(viagem.data_saida)} → {formatDate(viagem.data_retorno)}
          </p>
          {viagem.observacoes && (
            <p className="text-sm text-gray-400 mt-1">{viagem.observacoes}</p>
          )}
        </div>
        <Button variant="secondary" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      {/* EVENTOS VINCULADOS */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Eventos da viagem
          </h2>
          <Button
            variant="secondary"
            onClick={() => router.push(`/dashboard/eventos/novo?viagem_id=${id}`)}
          >
            + Criar novo evento
          </Button>
        </div>

        {eventos.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum evento vinculado ainda.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {evento.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    📅 {evento.data} · 📍 {evento.local}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => router.push(`/dashboard/eventos/${evento.id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDesvincularEvento(evento.id)}
                  >
                    Desvincular
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* VINCULAR EVENTOS EXISTENTES */}
      {allEvents.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Vincular evento existente
          </h2>
          <div className="flex flex-col gap-2">
            {allEvents.map((evento) => (
              <div
                key={evento.id}
                className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-3 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {evento.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    📅 {evento.data} · 📍 {evento.local}
                  </p>
                </div>
                <Button onClick={() => handleVincularEvento(evento.id)}>
                  Vincular
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ESCALA DA VIAGEM */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Escala da viagem
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          A escala será replicada automaticamente para todos os eventos desta viagem.
        </p>

        <EventShiftsManager
          shifts={shifts}
          setShifts={setShifts}
          eventDate={viagem.data_saida}
        />

        <div className="flex justify-end mt-4">
          <Button onClick={handleSaveScale} disabled={isSavingScale}>
            {isSavingScale ? 'Salvando...' : 'Salvar escala'}
          </Button>
        </div>
      </section>

    </div>
  );
}