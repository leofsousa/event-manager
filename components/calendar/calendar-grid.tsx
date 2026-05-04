import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import type { Event } from '@/types/type-event';

type TravelRange = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type CalendarTravelDay = {
  id: string;
  nome: string;
  isStart: boolean;
  isEnd: boolean;
  isSingle: boolean;
};

type Props = {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  travelRanges?: TravelRange[];
  mode: 'admin' | 'colaborador';
  onEventClick?: (event: Event) => void;
};

const formatDate = (date: Date) => date.toLocaleDateString('en-CA');
const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarGrid({ year, month, eventsByDate, travelRanges = [], mode, onEventClick }: Props) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  const dateIndexMap = new Map<string, number>();
  cells.forEach((date, index) => {
    if (date) {
      dateIndexMap.set(formatDate(date), index);
    }
  });

  const firstVisibleDate = cells.find(Boolean) as Date | undefined;
  const lastVisibleDate = [...cells].reverse().find(Boolean) as Date | undefined;

  const travelDays: Record<string, CalendarTravelDay[]> = {};

  travelRanges.forEach((travel) => {
    const start = new Date(`${travel.data_saida}T00:00:00`);
    const end = new Date(`${travel.data_retorno}T00:00:00`);
    if (!firstVisibleDate || !lastVisibleDate) return;

    const clipStart = start < firstVisibleDate ? firstVisibleDate : start;
    const clipEnd = end > lastVisibleDate ? lastVisibleDate : end;
    if (clipStart > clipEnd) return;

    let current = new Date(clipStart);
    while (current <= clipEnd) {
      const dateKey = formatDate(current);
      const isStart = current.getTime() === start.getTime();
      const isEnd = current.getTime() === end.getTime();
      const travelItem = {
        id: travel.id,
        nome: travel.nome,
        isStart,
        isEnd,
        isSingle: isStart && isEnd,
      };

      if (!travelDays[dateKey]) {
        travelDays[dateKey] = [];
      }
      travelDays[dateKey].push(travelItem);

      current.setDate(current.getDate() + 1);
    }
  });

  return (
    <div className="overflow-x-auto">
      <div className="relative">
        <div className="grid grid-cols-7 gap-2 min-w-[700px] mb-2 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
          {weekDayNames.map((name) => (
            <div key={name} className="py-2">
              {name}
            </div>
          ))}
        </div>

        <div
          className="grid grid-cols-7 gap-2 min-w-[700px] mb-2"
          style={{ gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, auto)' }}
        >
          {cells.map((date, index) => {
            if (!date) return <div key={index} />;

            const dateStr = formatDate(date);
            const dayEvents = eventsByDate[dateStr] || [];
            const travel = travelDays[dateStr] || [];

            return (
              <CalendarDayCell
                key={index}
                date={date}
                events={dayEvents}
                travel={travel}
                mode={mode}
                onEventClick={onEventClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
