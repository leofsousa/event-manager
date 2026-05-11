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

const DAY_WIDTH = 120;

const formatDateKey = (date: Date) => {
  return date.toISOString().split('T')[0];
};

export default function CalendarTimeline({
  year,
  month,
  events,
  viagens,
  mode,
  onEventClick,
}: Props) {

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }).map((_, index) => {
    return new Date(year, month, index + 1);
  });

  return (
    <div
      className="
        overflow-x-auto overflow-y-hidden
        rounded-2xl
        border border-gray-200
        bg-white
        dark:border-gray-800
        dark:bg-gray-950
      "
    >

      <div
        style={{
          width: `${days.length * DAY_WIDTH}px`,
        }}
      >

        {/* HEADER */}
        <div className="border-b border-gray-200 dark:border-gray-800">

          <div
            className="flex"
            style={{
              width: `${days.length * DAY_WIDTH}px`,
            }}
          >

            {days.map((day) => {

              const isToday =
                new Date().toDateString() === day.toDateString();

              return (
                <div
                  key={day.toISOString()}
                  style={{
                    width: `${DAY_WIDTH}px`,
                    minWidth: `${DAY_WIDTH}px`,
                  }}
                  className={`
                    flex flex-col gap-1
                    border-r border-gray-200
                    px-3 py-3
                    dark:border-gray-800

                    ${isToday
                      ? 'bg-blue-50 dark:bg-blue-950/30'
                      : ''
                    }
                  `}
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

        </div>

        {/* ROW VIAGENS */}
        <div className="border-b border-gray-200 dark:border-gray-800">

          <div
            className="flex"
            style={{
              width: `${days.length * DAY_WIDTH}px`,
            }}
          >

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
                  style={{
                    width: `${DAY_WIDTH}px`,
                    minWidth: `${DAY_WIDTH}px`,
                  }}
                  className="
                    min-h-[140px]
                    border-r border-gray-200
                    p-2
                    dark:border-gray-800
                  "
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
                            rounded-2xl bg-purple-500
                            px-3 py-2 text-white
                            shadow-sm
                          "
                        >

                          {isStart && (
                            <p className="mb-2 text-xs font-semibold">
                              🚐 {viagem.nome}
                            </p>
                          )}

                          <div className="flex flex-col gap-1">

                            {eventosDaViagem.map((event) => (
                              <button
                                key={event.id}
                                onClick={() => onEventClick?.(event)}
                                className="
                                  rounded-lg bg-white/20
                                  px-2 py-1 text-left
                                  text-[11px]
                                  transition hover:bg-white/30
                                "
                              >

                                <div className="flex items-center gap-2">

                                  {event.channel?.sigla && (
                                    <span
                                      className="
                                        rounded bg-white/20
                                        px-1.5 py-[1px]
                                        text-[10px] font-semibold
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

        {/* PLACEHOLDER */}
        <div className="p-10">

          <div
            className="
              flex items-center justify-center
              rounded-2xl border border-dashed
              border-gray-300 py-20
              dark:border-gray-700
            "
          >

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Próxima etapa: linhas operacionais dos estúdios
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}