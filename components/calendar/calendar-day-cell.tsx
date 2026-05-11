import CalendarEventItem from './calendar-event-item';
import type { Event } from '@/types/type-event';

type Props = {
  date: Date;
  events: Event[];
  mode: 'admin' | 'colaborador';
  onEventClick?: (event: Event) => void;
  isToday?: boolean;
  travelOffset?: number;
};

export default function CalendarDayCell({
  date,
  events,
  mode,
  onEventClick,
  isToday,
  travelOffset = 0,
}: Props) {
  return (
    <div
      className={`
        flex flex-col border rounded-xl p-2 min-h-[120px]
        relative
        ${isToday
          ? 'bg-blue-50 border-blue-400 dark:bg-blue-950/70 dark:border-blue-900'
          : 'bg-white border-gray-200 dark:bg-gray-950 dark:border-gray-700'
        }
      `}
    >
      <div className="flex justify-end mb-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {date.getDate()}
        </span>
      </div>

      {/* espaço viagens */}
      {travelOffset > 0 && (
        <div style={{ height: travelOffset }} />
      )}

      <div className="flex flex-col gap-1">
        {events.map((event) => (
          <CalendarEventItem
            key={event.id}
            event={event}
            mode={mode}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}