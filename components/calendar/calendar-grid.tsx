import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import type { Event } from '@/types/type-event';

type Props = {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  mode: 'admin' | 'colaborador';
};

export default function CalendarGrid({ year, month, eventsByDate, mode }: Props) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  const viagensMap = new Map<string, { start: string; end: string }>();

  Object.values(eventsByDate).forEach((events) => {
    events.forEach((event) => {
      if (event.viagem && event.viagem.id) {

        if (!viagensMap.has(event.viagem.id)) {
          viagensMap.set(event.viagem.id, {
            start: new Date(event.viagem.data_saida + 'T00:00:00').toLocaleDateString('en-CA'),
            end: new Date(event.viagem.data_retorno + 'T00:00:00').toLocaleDateString('en-CA'),
          });
        }

      }
    });
  });

  const travelRanges = Array.from(viagensMap.values());

  const getTravelPosition = (dateStr: string): 'start' | 'middle' | 'end' | null => {
    for (const range of travelRanges) {
      if (dateStr === range.start) return 'start';
      if (dateStr === range.end) return 'end';
      if (dateStr > range.start && dateStr < range.end) return 'middle';
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-2 min-w-[700px]">

        {cells.map((date, index) => {
          if (!date) return <div key={index} />;

          const dateStr = date.toLocaleDateString('en-CA');
          const dayEvents = eventsByDate[dateStr] || [];

          const travelPosition = getTravelPosition(dateStr);

          return (
            <CalendarDayCell
              key={index}
              date={date}
              events={dayEvents}
              mode={mode}
              travelPosition={travelPosition}
            />
          );
        })}

      </div>
    </div>
  );
}
