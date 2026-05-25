'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { mapEventsWithUserScale } from '@/app/utils/map-events-with-user-scale';
import type { Event } from '@/types/type-event';
import CalendarView from '@/components/calendar/calendar-view';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

export default function ColaboradorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setLoadingEvents(true);
    setEventsError(null);

    const [eventsResponse, viagensResponse] = await Promise.all([
      supabase
        .from('events')
        .select(`
          *,
          viagem:viagem_id (
            id,
            nome,
            data_saida,
            data_retorno
          ),
          creator:profiles!events_created_by_fkey(username, email),
          channels(sigla),
          event_shifts(
            id,
            start_time,
            end_time,
            event_shift_collaborators(
              collaborator_id
            )
          )
        `)
        .order('data', { ascending: true }),

      supabase.from('viagens').select('*').order('data_saida', { ascending: true }),
    ]);

    if (eventsResponse.error) {
      console.error(eventsResponse.error);
      setEventsError(eventsResponse.error.message);
      setEvents([]);
      setViagens([]);
      setLoadingEvents(false);
      return;
    }

    if (viagensResponse.error) {
      console.error(viagensResponse.error);
    }

    const mapped = mapEventsWithUserScale(
      (eventsResponse.data as Record<string, unknown>[]) || [],
      user.id,
    );

    setEvents(mapped);
    setViagens((viagensResponse.data as Viagem[]) || []);
    setLoadingEvents(false);
  }, [user]);

  const scaledCount = useMemo(
    () => events.filter((event) => event.isUserScaled).length,
    [events]
  );

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user) {
      fetchEvents();
    }
  }, [loading, user, fetchEvents]);

  if (loading || loadingEvents) {
    return (
      <div className="flex min-h-0 flex-1 flex-col p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Minha Agenda
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Carregando escala...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Minha Agenda
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {scaledCount > 0
            ? `${scaledCount} escala${scaledCount !== 1 ? 's' : ''} neste período`
            : 'Nenhuma escala no período selecionado'}
        </p>
      </div>

      {eventsError && (
        <p className="shrink-0 px-6 pt-4 text-sm text-red-500">
          Erro ao carregar eventos: {eventsError}
        </p>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-6 pt-4">
        <CalendarView events={events} viagens={viagens} mode="colaborador" />
      </div>
    </div>
  );
}
