'use client';

import { useMemo, useState } from 'react';
import type { Event } from '@/types/type-event';
import CalendarGrid from '@/components/calendar/calendar-grid';

type Props = {
  events: Event[];
  mode?: 'admin' | 'viewer';
};

export default function CalendarView({ events, mode = 'admin' }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const groupedEvents = useMemo(() => {
    return events.reduce((acc, event) => {
      const date = event.data;

      if (!acc[date]) acc[date] = [];
      acc[date].push(event);

      return acc;
    }, {} as Record<string, Event[]>);
  }, [events]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="flex flex-col gap-4">

      <div className="flex items-center justify-between">
        <button onClick={handlePrevMonth}>←</button>

        <h2 className="text-lg font-semibold">
          {currentDate.toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          })}
        </h2>

        <button onClick={handleNextMonth}>→</button>
      </div>

      <CalendarGrid
        year={year}
        month={month}
        eventsByDate={groupedEvents}
        mode={mode}
      />
    </div>
  );
}
