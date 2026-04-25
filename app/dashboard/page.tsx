'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import CalendarView from "@/components/calendar/calendar-view";
import type { Event } from '@/types/type-event';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_shifts ( id ),
        channels ( sigla )
      `);

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((event: any) => ({
      ...event,
      hasScale: (event.event_shifts || []).length > 0,
    }));

    setEvents(formatted);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="p-4">
      <CalendarView events={events} mode="admin" />
    </div>
  );
}
