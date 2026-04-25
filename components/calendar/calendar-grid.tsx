import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import type { Event } from '@/types/type-event';

type Props = {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  mode: 'admin' | 'viewer';
};

export default function CalendarGrid({
  year,
  month,
  eventsByDate,
  mode,
}: Props) {

  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  return (
    <div className="overflow-x-auto">

      <div className="
        grid grid-cols-7 gap-2
        min-w-[700px]   // 👈 garante scroll no mobile
      ">

        {cells.map((date, index) => {
          if (!date) {
            return <div key={index} />;
          }

          const dateStr = date.toLocaleDateString('en-CA');
          const dayEvents = eventsByDate[dateStr] || [];

          return (
            <CalendarDayCell
              key={index}
              date={date}
              events={dayEvents}
              mode={mode}
            />
          );
        })}

      </div>
    </div>
  );
}
