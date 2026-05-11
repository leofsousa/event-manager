'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';

import CalendarView from '@/components/calendar/calendar-view';

import type { Event } from '@/types/type-event';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

export default function Dashboard() {
  const { user, loading } = useAuth();

  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);

  const [loadingEvents, setLoadingEvents] = useState(true);

  const [eventsError, setEventsError] = useState<string | null>(null);

  /**
   * Redirect login
   */
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    setLoadingEvents(true);
    setEventsError(null);

    /**
     * EVENTS
     */
    const eventsResponse = await supabase
      .from('events')
      .select(`
        *,
        channels(sigla),
        event_shifts(
          id,
          start_time,
          end_time,
          event_shift_collaborators(
            collaborator_id
          )
        )
      `);

    /**
     * VIAGENS
     */
    const viagensResponse = await supabase
      .from('viagens')
      .select(`
        id,
        nome,
        data_saida,
        data_retorno
      `);

    /**
     * Errors
     */
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

      setEventsError(viagensResponse.error.message);

      setViagens([]);

      setLoadingEvents(false);

      return;
    }

    /**
     * Helper
     */
    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);

      return h * 60 + m;
    };

    /**
     * Format events
     */
    const formattedEvents = (eventsResponse.data || []).map((event: any) => {
      const shifts = event.event_shifts || [];

      const hasScale = shifts.length > 0;

      const userShift =
        shifts.find((shift: any) =>
          shift.event_shift_collaborators?.some(
            (collaborator: any) =>
              collaborator.collaborator_id === user?.id
          )
        ) ?? null;

      const isUserScaled = !!userShift;

      let arrivalTime: string | null = null;

      let isFirstShift = false;

      if (userShift?.start_time) {
        const earliestShift =
          [...shifts]
            .filter((s: any) => s.start_time)
            .sort(
              (a: any, b: any) =>
                toMinutes(a.start_time) -
                toMinutes(b.start_time)
            )[0] ?? null;

        isFirstShift = earliestShift?.id === userShift.id;

        if (isFirstShift) {
          const [h, m] =
            userShift.start_time.split(':').map(Number);

          const arrival = new Date();

          arrival.setHours(h - 1, m, 0);

          arrivalTime = arrival.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }

      return {
        ...event,
        channel: event.channels ?? null,
        hasScale,
        isUserScaled,
        userShift,
        isFirstShift,
        arrivalTime,
      };
    });

    setEvents(formattedEvents);
    setViagens(viagensResponse.data || []);

    setLoadingEvents(false);
  }, [user]);

  /**
   * Initial load
   */
  useEffect(() => {
    if (!loading && user) {
      fetchDashboardData();
    }
  }, [loading, user, fetchDashboardData]);

  /**
   * Loading
   */
  if (loading || loadingEvents) {
    return (
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-200">
          Carregando agenda...
        </p>
      </div>
    );
  }

  /**
   * No user
   */
  if (!user) return null;

  return (
    <div className="p-4">

      {eventsError && (
        <p className="mb-4 text-sm text-red-500">
          Erro ao carregar agenda: {eventsError}
        </p>
      )}

      <CalendarView
        events={events}
        viagens={viagens}
        mode="admin"
      />

    </div>
  );
}