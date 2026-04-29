'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Event } from '@/types/type-event';
import CalendarGrid from '@/components/calendar/calendar-grid';
import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import TodayEventsSection from '@/components/calendar/today-events-section';
import { supabase } from '@/lib/supabase';

type Props = {
  events: Event[];
  mode?: 'admin' | 'colaborador';
  onDelete?: (event: Event) => void;
};

export default function CalendarView({ events, mode = 'admin', onDelete }: Props) {

  const [viagens, setViagens] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
  const fetchViagens = async () => {
    const { data } = await supabase.from('viagens').select('*');
    setViagens(data || []);
  };

  fetchViagens();
}, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);


  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const todayStr = new Date().toLocaleDateString('en-CA');

  const todayEvents = useMemo(() => {
    return events.filter((e) => e.data === todayStr && !(e as any).isTravel);
  }, [events, todayStr]);

 const groupedEvents = useMemo(() => {
  const map: Record<string, Event[]> = {};

  const addToDate = (date: Date, event: Event) => {
    const dateStr = date.toLocaleDateString('en-CA');
    if (!map[dateStr]) map[dateStr] = [];
    map[dateStr].push(event);
  };

  const viagensProcessadas = new Set<string>();

  events.forEach((event) => {
    const eventDate = new Date(event.data + 'T00:00:00');

    // ✅ EVENTO NORMAL (sempre aparece)
    addToDate(eventDate, event);

    // ✅ BLOCO DE VIAGEM (apenas 1 vez por viagem)
    if (event.viagem && !viagensProcessadas.has(event.viagem.id)) {

      viagensProcessadas.add(event.viagem.id);

      const start = new Date(event.viagem.data_saida + 'T00:00:00');
      const end = new Date(event.viagem.data_retorno + 'T00:00:00');

      let current = new Date(start);

      while (current <= end) {

        const dateStr = current.toLocaleDateString('en-CA');

        addToDate(new Date(current), {
          id: `viagem-${event.viagem.id}-${dateStr}`,
          nome: `🚐 ${event.viagem.nome}`,
          tipo: 'viagem',
          data: dateStr,
          local: '',
          observacoes: '',
          hasScale: true,

          viagem_id: event.viagem.id,
          isTravel: true,
          isTravelBlock: true,
          viagem: event.viagem,
        });

        current.setDate(current.getDate() + 1);
      }
    }
  });

  return map;
}, [events]);



  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(date.getDate() - date.getDay());

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  };

  const addDays = (date: Date, days: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + days);
    return newDate;
  };

  const handlePrev = () => {
    if (isMobile) {
      setCurrentDate(addDays(currentDate, -7));
    } else {
      setCurrentDate(new Date(year, month - 1, 1));
    }
  };

  const handleNext = () => {
    if (isMobile) {
      setCurrentDate(addDays(currentDate, 7));
    } else {
      setCurrentDate(new Date(year, month + 1, 1));
    }
  };

  return (
    <div className="flex flex-col gap-4">

      <TodayEventsSection
        events={todayEvents}
        mode={mode}
        onDelete={onDelete}
      />

      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          ←
        </button>

        <h2 className="text-lg font-semibold text-center">
          {isMobile
            ? `Semana de ${currentDate.toLocaleDateString('pt-BR')}`
            : currentDate.toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            })}
        </h2>

        <button
          onClick={handleNext}
          className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
        >
          →
        </button>
      </div>

      {isMobile ? (
        <div className="flex flex-col gap-2">
          {getWeekDays(currentDate).map((date) => {
            const dateStr = date.toLocaleDateString('en-CA');
            const dayEvents = groupedEvents[dateStr] || [];

            return (
              <CalendarDayCell
                key={dateStr}
                date={date}
                events={dayEvents}
                mode={mode}
              />
            );
          })}
        </div>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          eventsByDate={groupedEvents}
          mode={mode}
        />
      )}

    </div>
  );
}
