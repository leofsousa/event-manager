'use client';

import type { Event } from '@/types/type-event';
import CalendarEventItem from '@/components/calendar/calendar-event-item';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  date: Date;
  events: Event[];
  mode: 'admin' | 'colaborador';
};

export default function CalendarDayCell({ date, events, mode }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const router = useRouter();

  const todayStr = new Date().toLocaleDateString('en-CA');
  const dateStr = date.toLocaleDateString('en-CA');
  const isToday = todayStr === dateStr;

  return (
    <>
      <div
        className={`
          min-h-[140px] sm:min-h-[160px]
          border rounded-lg p-2 flex flex-col gap-1
          transition overflow-visible relative
          ${isToday
            ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20 dark:border-blue-500 z-10'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          }
        `}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {date.toLocaleDateString('pt-BR', { weekday: 'short' })}
          </span>
          <span
            className={`text-sm font-bold ${
              isToday
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-800 dark:text-gray-100'
            }`}
          >
            {date.getDate()}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {events.slice(0, 5).map((event) => (
            <CalendarEventItem
              key={event.id}
              event={event}
              mode={mode}
              alignRight={date.getDay() >= 4}
              alignTop={date.getDate() > 21}
              onClick={setSelectedEvent}
            />
          ))}
          {events.length > 5 && (
            <span className="text-[10px] text-gray-500">
              +{events.length - 5}
            </span>
          )}
        </div>
      </div>

      {/* MODAL */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl p-4 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">
              {selectedEvent.nome}
            </h3>

            <p>📅 {selectedEvent.data}</p>
            <p>📍 {selectedEvent.local}</p>

            {selectedEvent.channels?.sigla && (
              <p>📺 {selectedEvent.channels.sigla}</p>
            )}

            {selectedEvent.tipo && (
              <p>🏷 {selectedEvent.tipo}</p>
            )}

            {selectedEvent.observacoes && (
              <p className="mt-2 text-sm text-gray-500">
                {selectedEvent.observacoes}
              </p>
            )}

            {/* BOTÕES */}
            <div className="mt-4 flex gap-2">
              {mode === 'admin' && !(selectedEvent as any).isTravel && (
                <button
                  onClick={() => router.push(`/dashboard/eventos/${selectedEvent.id}`)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-2 rounded text-sm font-medium transition"
                >
                  ✏️ Editar
                </button>
              )}
              <button
                onClick={() => setSelectedEvent(null)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}