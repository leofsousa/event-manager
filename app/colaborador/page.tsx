'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/type-event';
import CalendarView from '@/components/calendar/calendar-view';

export default function ColaboradorPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      // Usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Eventos com shifts e colaboradores escalados
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          channels(sigla),
          event_shifts(
            id,
            event_shift_collaborators(
              collaborator_id
            )
          )
        `)
        .order('data', { ascending: true });

      if (error) { console.error(error); return; }

      // Mapeia hasScale e isUserScaled
      const mapped = (data as any[]).map((event) => {
        const shifts = event.event_shifts ?? [];

        const hasScale = shifts.length > 0;

        const isUserScaled = shifts.some((shift: any) =>
          shift.event_shift_collaborators?.some(
            (c: any) => c.collaborator_id === user.id
          )
        );

        return {
          ...event,
          hasScale,
          isUserScaled,
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