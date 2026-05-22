"use client";

import { useMemo, useState } from "react";

import type { Event } from "@/types/type-event";

import { CALENDAR_ROW_LABEL_WIDTH } from "@/components/calendar/calendar-row";
import CalendarTimeline, {
  CALENDAR_DAY_WIDTH,
} from "@/components/calendar/calendar-timeline";
import CalendarEventModal from "@/components/calendar/calendar-event-modal";
import HorizontalScrollSync from "@/components/calendar/horizontal-scroll-sync";

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type Props = {
  events: Event[];
  viagens?: Viagem[];
  mode?: "admin" | "colaborador";
};

const STUDIO_ORDER = [
  "estudio-1",
  "estudio-2",
  "estudio-3",
  "estudio-4",
  "__other__",
];

export default function CalendarView({
  events,
  viagens = [],
  mode = "admin",
}: Props) {
  const today = new Date();

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const daysInMonth = useMemo(
    () => new Date(selectedYear, selectedMonth + 1, 0).getDate(),
    [selectedYear, selectedMonth],
  );

  const timelineWidth =
    CALENDAR_ROW_LABEL_WIDTH + daysInMonth * CALENDAR_DAY_WIDTH;

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.data);

      return (
        eventDate.getMonth() === selectedMonth &&
        eventDate.getFullYear() === selectedYear
      );
    });
  }, [events, selectedMonth, selectedYear]);

  const sortedEvents = useMemo(() => {
    if (mode === "colaborador") {
      return [...filteredEvents].sort((a, b) => {
        const scaledDiff = Number(!!b.isUserScaled) - Number(!!a.isUserScaled);
        if (scaledDiff !== 0) return scaledDiff;
        return a.data.localeCompare(b.data);
      });
    }

    return [...filteredEvents].sort((a, b) => {
      const studioA = STUDIO_ORDER.indexOf(a.estudio || "__other__");
      const studioB = STUDIO_ORDER.indexOf(b.estudio || "__other__");

      if (studioA !== studioB) {
        return studioA - studioB;
      }

      return a.data.localeCompare(b.data);
    });
  }, [filteredEvents, mode]);

  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div
        className="
          flex shrink-0 flex-col gap-3
          sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="
              rounded-xl border border-gray-300
              bg-white px-4 py-2 text-sm
              dark:border-gray-700
              dark:bg-gray-900
              dark:text-white
            "
          >
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="
              rounded-xl border border-gray-300
              bg-white px-4 py-2 text-sm
              dark:border-gray-700
              dark:bg-gray-900
              dark:text-white
            "
          >
            {[selectedYear - 1, selectedYear, selectedYear + 1].map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {mode === "colaborador"
            ? "Clique em um evento para ver seus detalhes · sua escala ao final"
            : "Clique em um evento para ver a escala · minha escala ao final"}
        </p>
      </div>

      <div
        className="
          flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden
          rounded-2xl border border-gray-200
          dark:border-gray-800
        "
      >
        <HorizontalScrollSync contentWidth={timelineWidth}>
          <CalendarTimeline
            year={selectedYear}
            month={selectedMonth}
            events={sortedEvents}
            viagens={viagens}
            mode={mode}
            onEventClick={setSelectedEvent}
          />
        </HorizontalScrollSync>
      </div>

      {selectedEvent && (
        <CalendarEventModal
          event={selectedEvent}
          mode={mode}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </div>
  );
}
