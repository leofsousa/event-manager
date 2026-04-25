import type { Event } from '@/types/type-event';
import CalendarEventItem from '@/components/calendar/calendar-event-item';

type Props = {
    date: Date;
    events: Event[];
    mode: 'admin' | 'viewer';
};

export default function CalendarDayCell({ date, events, mode }: Props) {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const dateStr = date.toLocaleDateString('en-CA');

    const isToday = todayStr === dateStr;


    return (
        <div
            className={`
                min-h-[140px] sm:min-h-[160px]
                border rounded-lg p-2 flex flex-col gap-1
                transition
                overflow-visible
                relative
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
                    className={`text-sm font-bold ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-800 dark:text-gray-100'}`}
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
