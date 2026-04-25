'use client';

import { useMemo, useState, useEffect } from 'react';
import type { Event } from '@/types/type-event';
import CalendarGrid from '@/components/calendar/calendar-grid';
import CalendarDayCell from '@/components/calendar/calendar-day-cell';

type Props = {
  events: Event[];
  mode?: 'admin' | 'viewer';
};

export default function CalendarView({ events, mode = 'admin' }: Props) {

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(false);

  // 📱 detectar mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 📦 agrupar eventos por data
  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = event.data;

      if (!acc[date]) acc[date] = [];
      acc[date].push(event);

      return acc;
    }, {} as Record<string, Event[]>);
  }, [events]);

  // 📅 helpers semana
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

  // 🔁 navegação
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

      {/* HEADER */}
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
