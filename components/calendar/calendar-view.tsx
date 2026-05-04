'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Event } from '@/types/type-event';
import CalendarGrid from '@/components/calendar/calendar-grid';
import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import TodayEventsSection from '@/components/calendar/today-events-section';
import Button from '@/components/ui/button';

type TravelRange = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type Props = {
  events: Event[];
  mode?: 'admin' | 'colaborador';
  onDelete?: (event: Event) => void;
};

export default function CalendarView({ events, mode = 'admin', onDelete }: Props) {

  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

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

  const { groupedEvents, travelRanges } = useMemo(() => {
    const map: Record<string, Event[]> = {};
    const travelRanges: TravelRange[] = [];
    const travelsProcessed = new Set<string>();

    const addToDate = (date: Date, event: Event) => {
      const dateStr = date.toLocaleDateString('en-CA');
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(event);
    };

    events.forEach((event) => {
      const eventDate = new Date(event.data + 'T00:00:00');
      addToDate(eventDate, event);

      if (event.viagem && !travelsProcessed.has(event.viagem.id)) {
        travelsProcessed.add(event.viagem.id);
        travelRanges.push({
          id: event.viagem.id,
          nome: event.viagem.nome,
          data_saida: event.viagem.data_saida,
          data_retorno: event.viagem.data_retorno,
        });
      }
    });

    return {
      groupedEvents: map,
      travelRanges,
    };
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

  const handleEventClick = (event: Event) => {
    if (mode === 'admin') {
      setSelectedEvent(event);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-1">
                  Evento
                </p>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {selectedEvent.nome}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p><span className="font-semibold">Tipo:</span> {selectedEvent.tipo}</p>
              <p><span className="font-semibold">Data:</span> {selectedEvent.data}</p>
              <p><span className="font-semibold">Local:</span> {selectedEvent.local}</p>
              {selectedEvent.observacoes && (
                <p><span className="font-semibold">Observações:</span> {selectedEvent.observacoes}</p>
              )}
              {selectedEvent.channel?.sigla && (
                <p><span className="font-semibold">Canal:</span> {selectedEvent.channel.sigla}</p>
              )}
            </div>

            <div className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:justify-end">
              <Button variant="secondary" onClick={() => setSelectedEvent(null)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  router.push(`/dashboard/eventos/${selectedEvent.id}`);
                  setSelectedEvent(null);
                }}
              >
                Editar
              </Button>
            </div>
          </div>
        </div>
      )}

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
                onEventClick={handleEventClick}
              />
            );
          })}
        </div>
      ) : (
        <CalendarGrid
          year={year}
          month={month}
          eventsByDate={groupedEvents}
          travelRanges={travelRanges}
          mode={mode}
          onEventClick={handleEventClick}
        />
      )}

    </div>
  );
}
