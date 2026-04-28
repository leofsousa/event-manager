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
        channels(sigla),
        event_shifts(
          id,
          start_time,
          end_time
        )
      `);

    if (error) { console.error(error); return; }

    const toMinutes = (time: string) => {
      const [h, m] = time.split(':').map(Number);
      return h * 60 + m;
    };

    const formatted = (data || []).map((event: any) => {
      const shifts = event.event_shifts || [];
      const hasScale = shifts.length > 0;

      const firstShift = shifts
        .filter((s: any) => s.start_time)
        .sort((a: any, b: any) => toMinutes(a.start_time) - toMinutes(b.start_time))[0] ?? null;

      return {
        ...event,
        hasScale,
        userShift: firstShift,
      };
    });

    setEvents(formatted);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) return <p>Carregando...</p>;
  if (!user) return null;

  return (
    <div className="p-4">
      <CalendarView events={events} mode="admin" onDelete={fetchEvents as any} />
    </div>
  );
}