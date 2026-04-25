import type { Event } from '@/types/type-event';
import CalendarEventItem from '@/components/calendar/calendar-event-item';

type Props = {
  date: Date;
  events: Event[];
  mode: 'admin' | 'viewer';
};

export default function CalendarDayCell({ date, events, mode }: Props) {

  return (
    <div className="
      min-h-[100px]
      border border-gray-200 dark:border-gray-700
      rounded-lg p-2 flex flex-col gap-1
      bg-white dark:bg-gray-800
    ">

      <span className="text-xs font-semibold text-gray-500">
        {date.getDate()}
      </span>

      <div className="flex flex-col gap-1">
        {events.slice(0, 3).map((event) => (
          <CalendarEventItem
            key={event.id}
            event={event}
            mode={mode}
          />
        ))}

        {events.length > 3 && (
          <span className="text-[10px] text-gray-500">
            +{events.length - 3}
          </span>
        )}
      </div>

    </div>
  );
}
