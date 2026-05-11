'use client';

import type { Event } from '@/types/type-event';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type Props = {
  year: number;
  month: number;
  events: Event[];
  viagens: Viagem[];
  mode: 'admin' | 'colaborador';
  onEventClick?: (event: Event) => void;
};

const DAY_WIDTH = 140;

const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function CalendarTimeline({
  year,
  month,
  events,
  viagens,
  onEventClick,
}: Props) {

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }).map((_, index) => {
    return new Date(year, month, index + 1);
  });

  const timelineWidth = days.length * DAY_WIDTH;

  return (
    <div className="w-full">

      {/* SCROLL REAL */}
      <div
        className="
          w-full
          overflow-x-auto
          overflow-y-hidden
          rounded-2xl
          border border-gray-200
          bg-white
          dark:border-gray-800
          dark:bg-gray-950
        "
      >

        {/* TIMELINE FIXA */}
        <div
          className="flex flex-col"
          style={{
            width: `${timelineWidth}px`,
            minWidth: `${timelineWidth}px`,
          }}
        >

          {/* HEADER */}
          <div className="flex border-b border-gray-200 dark:border-gray-800">

            {days.map((day) => {

              const isToday =
                new Date().toDateString() === day.toDateString();

              return (
                <div
                  key={day.toISOString()}
                  className={`
                    flex flex-col
                    border-r border-gray-200
                    px-3 py-3
                    dark:border-gray-800

                    ${isToday
                      ? 'bg-blue-50 dark:bg-blue-950/30'
                      : ''
                    }
                  `}
                  style={{
                    width: `${DAY_WIDTH}px`,
                    minWidth: `${DAY_WIDTH}px`,
                  }}
                >

                  <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    {day.toLocaleDateString('pt-BR', {
                      weekday: 'short',
                    })}
                  </span>

                  <span
                    className={`
                      text-lg font-semibold

                      ${isToday
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-900 dark:text-gray-100'
                      }
                    `}
                  >
                    {day.getDate()}
                  </span>

                </div>
              );
            })}

          </div>

          {/* ROW VIAGENS */}
          <div className="flex">

            {days.map((day) => {

              const dateKey = formatDateKey(day);

              const viagensAtivas = viagens.filter((viagem) => {
                return (
                  dateKey >= viagem.data_saida &&
                  dateKey <= viagem.data_retorno
                );
              });

              return (
                <div
                  key={dateKey}
                  className="
                    min-h-[160px]
                    border-r border-gray-200
                    p-2
                    dark:border-gray-800
                  "
                  style={{
                    width: `${DAY_WIDTH}px`,
                    minWidth: `${DAY_WIDTH}px`,
                  }}
                >

                  <div className="flex flex-col gap-2">

                    {viagensAtivas.map((viagem) => {

                      const isStart =
                        dateKey === viagem.data_saida;

                      const eventosDaViagem = events.filter((event) => {
                        return event.viagem_id === viagem.id;
                      });

                      return (
                        <div
                          key={`${viagem.id}-${dateKey}`}
                          className="
                            rounded-2xl
                            bg-purple-500
                            px-3 py-2
                            text-white
                            shadow-sm
                          "
                        >

                          {isStart && (
                            <p className="mb-2 text-xs font-semibold">
                              🚐 {viagem.nome}
                            </p>
                          )}

                          <div className="flex flex-col gap-1">

                            {eventosDaViagem.map((event, index) => (
                              <button
                                key={`${event.nome}-${index}`}
                                onClick={() => onEventClick?.(event)}
                                className="
                                  rounded-lg
                                  bg-white/20
                                  px-2 py-1
                                  text-left text-[11px]
                                  transition
                                  hover:bg-white/30
                                "
                              >

                                <div className="flex items-center gap-2">

                                  {event.channel?.sigla && (
                                    <span
                                      className="
                                        rounded
                                        bg-white/20
                                        px-1.5 py-[1px]
                                        text-[10px]
                                        font-semibold
                                      "
                                    >
                                      {event.channel.sigla}
                                    </span>
                                  )}

                                  <span className="truncate">
                                    {event.nome}
                                  </span>

                                </div>

                              </button>
                            ))}

                          </div>

                        </div>
                      );
                    })}

                  </div>

                </div>
              );
            })}

          </div>

        </div>

      </div>

    </div>
  );
}