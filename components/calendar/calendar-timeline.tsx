"use client";

import type { Event } from "@/types/type-event";

import CalendarRow, {
  CALENDAR_ROW_LABEL_WIDTH,
} from "@/components/calendar/calendar-row";
import CalendarEventChip from "@/components/calendar/calendar-event-chip";
import MyScaleRow from "@/components/calendar/my-scale-row";
import ViagensCalendarRow from "@/components/calendar/viagens-calendar-row";

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

export const CALENDAR_DAY_WIDTH = 140;
const DAY_WIDTH = CALENDAR_DAY_WIDTH;

const STUDIO_KEYS = ["estudio-1", "estudio-2", "estudio-3", "estudio-4"];

const STUDIO_ROWS = [
  { key: "estudio-1", title: "Estúdio 1" },
  { key: "estudio-2", title: "Estúdio 2" },
  { key: "estudio-3", title: "Estúdio 3" },
  { key: "estudio-4", title: "Estúdio 4" },
] as const;

const channelStyles: Record<string, string> = {
  CR: "bg-[#a9e22c] text-white",
  CC: "bg-[#d79230] text-white",
  TV: "bg-[#904712] text-white",
  "A+": "bg-[#335a45] text-white",
  RW: "bg-[#006e96] text-white",
  "RW+": "bg-[#37b4d8] text-white",
  CB: "bg-white text-black",
};

export const getChannelBadgeClass = (sigla?: string) => {
  if (!sigla) return "bg-gray-500 text-white";
  return channelStyles[sigla] || "bg-gray-500 text-white";
};

const getEventStudio = (event: Event) => {
  const local = event.local?.toLowerCase()?.trim();

  if (local && STUDIO_KEYS.includes(local)) {
    return local;
  }

  return "viagens";
};

type StudioEventsProps = {
  events: Event[];
  mode: "admin" | "colaborador";
  onEventClick?: (event: Event) => void;
};

function StudioEvents({ events, mode, onEventClick }: StudioEventsProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <CalendarEventChip
          key={event.id}
          event={event}
          mode={mode}
          onClick={onEventClick}
          getChannelBadgeClass={getChannelBadgeClass}
        />
      ))}
    </div>
  );
}

export default function CalendarTimeline({
  year,
  month,
  events,
  viagens,
  mode,
  onEventClick,
}: Props) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: daysInMonth }).map(
    (_, index) => new Date(year, month, index + 1),
  );

  const timelineWidth =
    CALENDAR_ROW_LABEL_WIDTH + days.length * DAY_WIDTH;

  return (
    <div
      className="flex flex-col bg-white dark:bg-gray-950"
      style={{ width: `${timelineWidth}px`, minWidth: `${timelineWidth}px` }}
    >
      <div className="sticky top-0 z-30 flex border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div
          className="
            sticky left-0 z-50 flex shrink-0 items-end
            border-r border-gray-200 bg-white px-3 py-3
            dark:border-gray-800 dark:bg-gray-950
          "
          style={{
            width: `${CALENDAR_ROW_LABEL_WIDTH}px`,
            minWidth: `${CALENDAR_ROW_LABEL_WIDTH}px`,
          }}
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Dias
          </span>
        </div>

        <div className="flex">
          {days.map((day) => {
            const isToday = new Date().toDateString() === day.toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`
                  flex flex-col border-r border-gray-200 px-3 py-3 dark:border-gray-800
                  ${isToday ? "bg-blue-50 dark:bg-blue-950/30" : ""}
                `}
                style={{ width: `${DAY_WIDTH}px`, minWidth: `${DAY_WIDTH}px` }}
              >
                <span className="text-xs uppercase text-gray-500 dark:text-gray-400">
                  {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                </span>
                <span
                  className={`text-lg font-semibold ${
                    isToday
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-900 dark:text-gray-100"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

        <ViagensCalendarRow
          days={days}
          dayWidth={DAY_WIDTH}
          viagens={viagens}
          events={events}
          mode={mode}
          onEventClick={onEventClick}
          getChannelBadgeClass={getChannelBadgeClass}
        />

        {STUDIO_ROWS.map(({ key, title }) => (
          <CalendarRow key={key} title={title} days={days} dayWidth={DAY_WIDTH}>
            {(dateKey: string) => {
              const studioEvents = events.filter(
                (event) => getEventStudio(event) === key && event.data === dateKey,
              );

              return (
                <StudioEvents
                  events={studioEvents}
                  mode={mode}
                  onEventClick={onEventClick}
                />
              );
            }}
          </CalendarRow>
        ))}

        <MyScaleRow
          days={days}
          dayWidth={DAY_WIDTH}
          events={events}
          onEventClick={onEventClick}
          getChannelBadgeClass={getChannelBadgeClass}
        />
    </div>
  );
}
