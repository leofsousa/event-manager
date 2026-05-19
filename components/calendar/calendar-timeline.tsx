"use client";

import type { Event } from "@/types/type-event";

import CalendarRow from "@/components/calendar/calendar-row";

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
  mode: "admin" | "colaborador";
  onEventClick?: (event: Event) => void;
};

type TravelDayContentProps = {
  viagem: Viagem;
  dateKey: string;
  cidade: string;
  isStart: boolean;
  isEnd: boolean;
  eventos: Event[];
  onEventClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
};

function TravelDayContent({
  viagem,
  cidade,
  isStart,
  isEnd,
  eventos,
  onEventClick,
  getChannelBadgeClass,
}: TravelDayContentProps) {
  return (
    <div
      className={`
        relative
        min-h-[110px]
        overflow-hidden
        border-y border-purple-400
        bg-purple-500/10

        ${isStart ? "rounded-l-2xl border-l" : ""}
        ${isEnd ? "rounded-r-2xl border-r" : ""}
      `}
    >
      {/* HEADER DA VIAGEM */}
      {(isStart || isEnd) && (
        <div className="px-2 pt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                🚐 {viagem.nome}
              </p>

              <p className="truncate text-[10px] text-purple-600 dark:text-purple-400">
                {cidade}
              </p>
            </div>

            <span className="shrink-0 rounded-full bg-purple-600 px-2 py-[2px] text-[9px] font-semibold text-white">
              {isStart ? "Saída" : isEnd ? "Retorno" : "Viagem"}
            </span>
          </div>
        </div>
      )}

      {/* EVENTOS */}
      <div className="mt-2 flex flex-col gap-1 px-2 pb-2">
        {eventos.map((event, index) => (
          <button
            key={`${event.nome}-${index}`}
            type="button"
            onClick={() => onEventClick?.(event)}
            className="
              w-full
              overflow-hidden
              rounded-lg
              border border-purple-300
              bg-white/90
              px-2 py-1
              text-left
              transition
              hover:bg-white

              dark:border-purple-800
              dark:bg-gray-950/80
            "
          >
            <div className="flex items-center gap-1 overflow-hidden">
              {event.channel?.sigla && (
                <span
                  className={`
                    shrink-0
                    rounded
                    px-1 py-[1px]
                    text-[9px]
                    font-semibold
                    ${getChannelBadgeClass(event.channel?.sigla)}
                  `}
                >
                  {event.channel?.sigla}
                </span>
              )}

              <span className="truncate text-[11px] font-semibold text-gray-900 dark:text-white">
                {event.nome}
              </span>
            </div>

            {event.hora_inicio && (
              <p className="mt-[2px] text-[10px] text-gray-500 dark:text-gray-400">
                {event.hora_inicio}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
const DAY_WIDTH = 140;

const STUDIO_KEYS = ["estudio-1", "estudio-2", "estudio-3", "estudio-4"];

const channelStyles: Record<string, string> = {
  CR: "bg-[#a9e22c] text-white",
  CC: "bg-[#d79230] text-white",
  TV: "bg-[#904712] text-white",
  "A+": "bg-[#335a45] text-white",
  RW: "bg-[#006e96] text-white",
  "RW+": "bg-[#37b4d8] text-white",
  CB: "bg-white text-black",
};

const getChannelBadgeClass = (sigla?: string) => {
  if (!sigla) {
    return "bg-gray-500 text-white";
  }

  return channelStyles[sigla] || "bg-gray-500 text-white";
};

const getEventStudio = (event: Event) => {
  const local = event.local?.toLowerCase()?.trim();

  if (local && STUDIO_KEYS.includes(local)) {
    return local;
  }

  return "viagens";
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
    <div
      className="
        overflow-x-auto
        overflow-y-auto
        rounded-2xl
        border border-gray-200
        bg-white
        dark:border-gray-800
        dark:bg-gray-950
      "
    >
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
            const isToday = new Date().toDateString() === day.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`
                  flex flex-col
                  border-r border-gray-200
                  px-3 py-3
                  dark:border-gray-800

                  ${isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}
                `}
                style={{
                  width: `${DAY_WIDTH}px`,
                  minWidth: `${DAY_WIDTH}px`,
                }}
              >
                <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                  {day.toLocaleDateString("pt-BR", {
                    weekday: "short",
                  })}
                </span>

                <span
                  className={`
                    text-lg font-semibold

                    ${
                      isToday
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-900 dark:text-gray-100"
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
        <CalendarRow title="Viagens" days={days} dayWidth={DAY_WIDTH}>
          {(dateKey: string) => {
            const viagensAtivas = viagens.filter((viagem) => {
              return (
                dateKey >= viagem.data_saida && dateKey <= viagem.data_retorno
              );
            });

            const externalEvents = events.filter((event) => {
              return (
                getEventStudio(event) === "viagens" &&
                event.data === dateKey &&
                !event.viagem_id
              );
            });

            return (
              <div className="flex flex-col gap-2">
                {/* VIAGENS */}
                {viagensAtivas.map((viagem) => {
                  const isStart = dateKey === viagem.data_saida;
                  const isEnd = dateKey === viagem.data_retorno;

                  const eventosDoDia = events.filter((event) => {
                    return (
                      event.viagem_id === viagem.id && event.data === dateKey
                    );
                  });

                  const cidade =
                    eventosDoDia[0]?.local ||
                    viagem.nome.split("-").pop()?.trim() ||
                    "Em deslocamento";

                  return (
                    <TravelDayContent
                      key={`${viagem.id}-${dateKey}`}
                      viagem={viagem}
                      dateKey={dateKey}
                      cidade={cidade}
                      isStart={isStart}
                      isEnd={isEnd}
                      eventos={eventosDoDia}
                      onEventClick={onEventClick}
                      getChannelBadgeClass={getChannelBadgeClass}
                    />
                  );
                })}

                {/* EVENTOS EXTERNOS SEM VIAGEM */}
                {externalEvents.map((event, index) => (
                  <button
                    key={`${event.nome}-${index}`}
                    onClick={() => onEventClick?.(event)}
                    className="
                      rounded-xl
                      border border-gray-200
                      bg-gray-50
                      px-3 py-2
                      text-left
                      transition
                      hover:bg-gray-100

                      dark:border-gray-700
                      dark:bg-gray-900
                      dark:hover:bg-gray-800
                    "
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {event.channel?.sigla && (
                          <span
                            className={`
                              rounded
                              px-1.5 py-[1px]
                              text-[10px]
                              font-semibold
                              ${getChannelBadgeClass(event.channel?.sigla)}
                            `}
                          >
                            {event.channel?.sigla}
                          </span>
                        )}

                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {event.nome}
                        </span>
                      </div>

                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {event.local}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            );
          }}
        </CalendarRow>

        {/* ESTÚDIO 1 */}
        <CalendarRow title="Estúdio 1" days={days} dayWidth={DAY_WIDTH}>
          {(dateKey: string) => {
            const studioEvents = events.filter((event) => {
              return (
                getEventStudio(event) === "estudio-1" && event.data === dateKey
              );
            });

            return (
              <StudioEvents
                events={studioEvents}
                onEventClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            );
          }}
        </CalendarRow>

        {/* ESTÚDIO 2 */}
        <CalendarRow title="Estúdio 2" days={days} dayWidth={DAY_WIDTH}>
          {(dateKey: string) => {
            const studioEvents = events.filter((event) => {
              return (
                getEventStudio(event) === "estudio-2" && event.data === dateKey
              );
            });

            return (
              <StudioEvents
                events={studioEvents}
                onEventClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            );
          }}
        </CalendarRow>

        {/* ESTÚDIO 3 */}
        <CalendarRow title="Estúdio 3" days={days} dayWidth={DAY_WIDTH}>
          {(dateKey: string) => {
            const studioEvents = events.filter((event) => {
              return (
                getEventStudio(event) === "estudio-3" && event.data === dateKey
              );
            });

            return (
              <StudioEvents
                events={studioEvents}
                onEventClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            );
          }}
        </CalendarRow>

        {/* ESTÚDIO 4 */}
        <CalendarRow title="Estúdio 4" days={days} dayWidth={DAY_WIDTH}>
          {(dateKey: string) => {
            const studioEvents = events.filter((event) => {
              return (
                getEventStudio(event) === "estudio-4" && event.data === dateKey
              );
            });

            return (
              <StudioEvents
                events={studioEvents}
                onEventClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            );
          }}
        </CalendarRow>
      </div>
    </div>
  );
}

type StudioEventsProps = {
  events: Event[];
  onEventClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
};

function StudioEvents({
  events,
  onEventClick,
  getChannelBadgeClass,
}: StudioEventsProps) {
  return (
    <div className="flex flex-col gap-2">
      {events.map((event, index) => (
        <button
          key={`${event.nome}-${index}`}
          onClick={() => onEventClick?.(event)}
          className="
            rounded-xl
            border border-gray-200
            bg-gray-50
            px-3 py-2
            text-left
            transition
            hover:bg-gray-100

            dark:border-gray-700
            dark:bg-gray-900
            dark:hover:bg-gray-800
          "
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              {event.channel?.sigla && (
                <span
                  className={`
                    rounded
                    px-1.5 py-[1px]
                    text-[10px]
                    font-semibold
                    ${getChannelBadgeClass(event.channel?.sigla)}
                  `}
                >
                  {event.channel?.sigla}
                </span>
              )}

              <span className="text-xs font-semibold text-gray-900 dark:text-white">
                {event.nome}
              </span>
            </div>

            {"hora_inicio" in event && event.hora_inicio && (
              <span className="text-[11px] text-gray-500 dark:text-gray-400">
                {event.hora_inicio}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
