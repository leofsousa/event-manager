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
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Viagem
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {viagem.nome}
          </p>
        </div>

        <span className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
          {isStart ? "Início" : isEnd ? "Retorno" : "Em curso"}
        </span>
      </div>

      <p className="mb-3 text-[11px] text-gray-500 dark:text-gray-400">
        {cidade}
      </p>

      {eventos.length > 0 ? (
        <div className="flex flex-col gap-2">
          {eventos.map((event, index) => (
            <button
              key={`${event.nome}-${index}`}
              type="button"
              onClick={() => onEventClick?.(event)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-900 transition hover:border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-900"
            >
              <div className="flex items-center gap-2">
                {event.channel?.sigla && (
                  <span
                    className={`rounded px-1.5 py-[1px] text-[10px] font-semibold ${getChannelBadgeClass(
                      event.channel?.sigla,
                    )}`}
                  >
                    {event.channel?.sigla}
                  </span>
                )}

                <span className="font-semibold">{event.nome}</span>
              </div>

              {event.local && (
                <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  {event.local}
                </div>
              )}
            </button>
          ))}
        </div>
      ) : null}
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
                dateKey >= viagem.data_saida &&
                dateKey <= viagem.data_retorno
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
                      event.viagem_id === viagem.id &&
                      event.data === dateKey
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
                              ${getChannelBadgeClass(
                                event.channel?.sigla,
                              )}
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
                getEventStudio(event) === "estudio-1" &&
                event.data === dateKey
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
                getEventStudio(event) === "estudio-2" &&
                event.data === dateKey
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
                getEventStudio(event) === "estudio-3" &&
                event.data === dateKey
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
                getEventStudio(event) === "estudio-4" &&
                event.data === dateKey
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