'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import type { Event } from '@/types/type-event';

type TravelRange = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type Props = {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  travelRanges?: TravelRange[];
  mode: 'admin' | 'colaborador';
  onEventClick?: (event: Event) => void;
};

const formatDate = (date: Date) => date.toLocaleDateString('en-CA');

export default function CalendarGrid({
  year,
  month,
  eventsByDate,
  travelRanges = [],
  mode,
  onEventClick,
}: Props) {

  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [travelBars, setTravelBars] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(year, month, d));
  }

  const setCellRef = (dateStr: string, el: HTMLDivElement | null) => {
    if (el) cellRefs.current.set(dateStr, el);
  };

  const computeBars = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const gridRect = grid.getBoundingClientRect();

    const rows: { end: string }[] = [];
    const bars: any[] = [];

    const BAR_HEIGHT = 20;
    const GAP = 4;

    const getRow = (start: string, end: string) => {
      for (let i = 0; i < rows.length; i++) {
        if (start > rows[i].end) {
          rows[i].end = end;
          return i;
        }
      }
      rows.push({ end });
      return rows.length - 1;
    };

    travelRanges.forEach((travel) => {
      const row = getRow(travel.data_saida, travel.data_retorno);

      let current = new Date(travel.data_saida);

      while (current <= new Date(travel.data_retorno)) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + (6 - weekEnd.getDay()));

        const segmentEnd =
          weekEnd < new Date(travel.data_retorno)
            ? weekEnd
            : new Date(travel.data_retorno);

        const startStr = formatDate(current);
        const endStr = formatDate(segmentEnd);

        const startCell = cellRefs.current.get(startStr);
        const endCell = cellRefs.current.get(endStr);

        if (startCell && endCell) {
          const startRect = startCell.getBoundingClientRect();
          const endRect = endCell.getBoundingClientRect();

          bars.push({
            id: `${travel.id}-${startStr}`,
            nome: travel.nome,
            top: startRect.top - gridRect.top + row * (BAR_HEIGHT + GAP) + 4,
            left: startRect.left - gridRect.left,
            width: endRect.right - startRect.left,
            isStart: startStr === travel.data_saida,
            isEnd: endStr === travel.data_retorno,
          });
        }

        current = new Date(segmentEnd);
        current.setDate(current.getDate() + 1);
      }
    });

    setRowCount(rows.length);
    setTravelBars(bars);
  }, [travelRanges]);

  useEffect(() => {
    setTimeout(computeBars, 50);
    window.addEventListener('resize', computeBars);
    return () => window.removeEventListener('resize', computeBars);
  }, [computeBars]);

  return (
    <div className="overflow-x-auto">
      <div className="relative min-w-[700px]" ref={gridRef}>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((date, i) => {
            if (!date) return <div key={i} />;

            const dateStr = formatDate(date);
            const dayEvents = eventsByDate[dateStr] || [];

            return (
              <div key={i} ref={(el) => setCellRef(dateStr, el)}>
                <CalendarDayCell
                  date={date}
                  events={dayEvents}
                  mode={mode}
                  onEventClick={onEventClick}
                  travelOffset={rowCount * 24}
                />
              </div>
            );
          })}
        </div>

        {/* BARRAS */}
        {travelBars.map((bar) => (
          <div
            key={bar.id}
            style={{
              position: 'absolute',
              top: bar.top,
              left: bar.left,
              width: bar.width,
              height: 20,
              zIndex: 10,
            }}
            className={`
              flex items-center px-2 text-[10px] font-semibold text-white
              bg-purple-500 shadow-sm
              ${bar.isStart ? 'rounded-l-full' : ''}
              ${bar.isEnd ? 'rounded-r-full' : ''}
            `}
          >
            {bar.isStart && `🚐 ${bar.nome}`}
          </div>
        ))}
      </div>
    </div>
  );
}