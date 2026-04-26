'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Event } from '@/types/type-event';
import CalendarView from '@/components/calendar/calendar-view';

export default function ColaboradorPage() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, channels(sigla)')
        .order('data', { ascending: true });

      if (error) { console.error(error); return; }
      setEvents(data as Event[]);
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