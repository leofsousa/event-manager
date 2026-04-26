'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/type-event';
import CalendarView from '@/components/calendar/calendar-view';

export default function ColaboradorPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
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
        `)
        .order('data', { ascending: true });

      if (error) { console.error(error); return; }

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

        // Turno em que o usuário está escalado
        const userShift = shifts.find((shift: any) =>
          shift.event_shift_collaborators?.some(
            (c: any) => c.collaborator_id === user.id
          )
        ) ?? null;

        const isUserScaled = !!userShift;

        let arrivalTime: string | null = null;
        let isFirstShift = false;

        if (userShift?.start_time) {
          // Verifica se é o primeiro turno pelo menor start_time
          const earliestShift = [...shifts].sort(
            (a: any, b: any) => toMinutes(a.start_time) - toMinutes(b.start_time)
          )[0];

          isFirstShift = earliestShift?.id === userShift.id;

          // Chegada só se for o primeiro turno
          if (isFirstShift) {
            arrivalTime = calcArrival(userShift.start_time);
          }
        }

        return {
          ...event,
          hasScale,
          isUserScaled,
          userShift,
          arrivalTime,
          isFirstShift,
        };
      });

      setEvents(mapped as Event[]);
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Agenda
      </h1>
      <CalendarView events={events} mode="colaborador" />
    </div>
  );
}