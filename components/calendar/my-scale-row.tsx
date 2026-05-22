"use client";

import type { Event } from "@/types/type-event";

import CalendarRow from "@/components/calendar/calendar-row";
import CalendarEventChip from "@/components/calendar/calendar-event-chip";

type Props = {
  days: Date[];
  dayWidth: number;
  events: Event[];
  onEventClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
};

function EmptyDayHint() {
  return (
    <p className="text-[10px] italic text-gray-400 dark:text-gray-500">
      Sem escala
    </p>
  );
}

export default function MyScaleRow({
  days,
  dayWidth,
  events,
  onEventClick,
  getChannelBadgeClass,
}: Props) {
  const scaledEvents = events.filter((event) => event.isUserScaled);

  return (
    <CalendarRow
      title="Minha escala"
      days={days}
      dayWidth={dayWidth}
      highlighted
    >
      {(dateKey: string) => {
        const dayEvents = scaledEvents.filter((event) => event.data === dateKey);

        if (dayEvents.length === 0) {
          return <EmptyDayHint />;
        }

        return (
          <div className="flex flex-col gap-2">
            {dayEvents.map((event) => (
              <CalendarEventChip
                key={event.id}
                event={event}
                mode="colaborador"
                variant={event.viagem_id ? "travel" : "default"}
                onClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            ))}
          </div>
        );
      }}
    </CalendarRow>
  );
}
