'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { Event } from '@/types/type-event';
import CalendarView from '@/components/calendar/calendar-view';

export default function ColaboradorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    setLoadingEvents(true);
    setEventsError(null);

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        viagem:viagem_id (
          data_saida,
          data_retorno
        ),
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
      .order('data', { ascending: true });

    if (error) {
      console.error(error);
      setEventsError(error.message);
      setEvents([]);
      setLoadingEvents(false);
      return;
    }

    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const calcArrival = (startTime: string) => {
      const [h, m] = startTime.split(':').map(Number);
      const arrival = new Date();
      arrival.setHours(h - 1, m, 0);
      return arrival.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    const mapped = (data as any[]).map((event) => {
      const shifts = event.event_shifts ?? [];
      const hasScale = shifts.length > 0;

      const userShift = shifts.find((shift: any) =>
        shift.event_shift_collaborators?.some(
          (c: any) => c.collaborator_id === user.id
        )
      ) ?? null;

      const isUserScaled = !!userShift;

      let arrivalTime: string | null = null;
      let isFirstShift = false;

      if (userShift?.start_time) {
        const earliestShift = [...shifts].sort(
          (a: any, b: any) => toMinutes(a.start_time) - toMinutes(b.start_time)
        )[0];

        isFirstShift = earliestShift?.id === userShift.id;

        if (isFirstShift) {
          arrivalTime = calcArrival(userShift.start_time);
        }
      }

      return {
        ...event,
        channel: event.channels ?? event.channel ?? null,
        hasScale,
        isUserScaled,
        userShift,
        arrivalTime,
        isFirstShift,
      };
    });

    setEvents(mapped as Event[]);
    setLoadingEvents(false);
  }, [user]);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Agenda
        </h1>
        <p className="text-gray-700 dark:text-gray-200">Carregando agenda...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Agenda
      </h1>
      {eventsError && (
        <p className="mb-4 text-sm text-red-500">Erro ao carregar eventos: {eventsError}</p>
      )}
      <CalendarView events={events} mode="colaborador" />
    </div>
  );
}