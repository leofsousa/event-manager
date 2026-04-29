import CalendarEventItem from './calendar-event-item';
import type { Event } from '@/types/type-event';

type Props = {
  date: Date;
  events: Event[];
  mode: 'admin' | 'colaborador';
};

export default function CalendarDayCell({
  date,
  events,
  mode,
}: Props) {

  const dateStr = date.toLocaleDateString('pt-BR');

  // separa viagem do resto (não renderiza viagem aqui pois está como overlay no grid)
  const normalEvents = events.filter((e) => !e.isTravelBlock);

  return (
    <div className="flex flex-col border rounded-xl p-2 min-h-[100px] bg-white dark:bg-gray-800">

      {/* DATA */}
      <div className="text-xs font-semibold text-gray-500 mb-1">
        {dateStr}
      </div>

      {/* EVENTOS NORMAIS */}
      <div className="flex flex-col gap-[2px] mt-1">
        {normalEvents.map((event) => (
          <CalendarEventItem
            key={event.id}
            event={event}
            mode={mode}
          />
        ))}
      </div>

    </div>
  );
}
