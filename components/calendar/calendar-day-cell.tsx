import CalendarEventItem from './calendar-event-item';
import type { Event } from '@/types/type-event';

type TravelIndicator = {
  id: string;
  nome: string;
  isStart: boolean;
  isEnd: boolean;
  isSingle: boolean;
};

type Props = {
  date: Date;
  events: Event[];
  travel?: TravelIndicator[];
  mode: 'admin' | 'colaborador';
  onEventClick?: (event: Event) => void;
};

export default function CalendarDayCell({
  date,
  events,
  travel,
  mode,
  onEventClick,
}: Props) {

  const weekday = date.toLocaleDateString('pt-BR', { weekday: 'short' });
  const dayNumber = date.getDate();

  const travelEventsById = new Map<string, Event[]>();
  const normalEvents = events.filter((event) => {
    if (!event.viagem_id) return true;

    const list = travelEventsById.get(event.viagem_id) || [];
    list.push(event);
    travelEventsById.set(event.viagem_id, list);
    return false;
  });

  return (
    <div className="flex flex-col border rounded-xl p-2 min-h-[100px] bg-white dark:bg-gray-800 overflow-visible">

      {/* DATA */}
      <div className="text-xs font-semibold text-gray-500 mb-1">
        <span className="uppercase tracking-wider">{weekday}</span>
        <span className="block text-sm font-bold text-gray-900 dark:text-white">
          {dayNumber}
        </span>
      </div>

      {travel && travel.length > 0 && (
        <div className="mb-2 flex flex-col gap-1">
          {travel.map((item, idx) => {
            const travelEvents = travelEventsById.get(item.id) || [];

            return (
              <div
                key={`${item.id}-${idx}`}
                className={`overflow-hidden rounded-full bg-purple-400 text-white text-[10px] py-1 px-2 flex flex-col gap-1 ${
                  item.isStart || item.isSingle ? 'rounded-l-full' : ''
                } ${item.isEnd || item.isSingle ? 'rounded-r-full' : ''}`}
              >
                <div className="flex items-center gap-1 font-semibold">
                  <span>🚐</span>
                  <span className="truncate">{item.nome}</span>
                </div>

                {travelEvents.length > 0 && (
                  <div className="flex flex-col gap-0.5 pt-1 text-[10px] text-white/90">
                    {travelEvents.map((travelEvent) => (
                      <button
                        key={travelEvent.id}
                        type="button"
                        onClick={() => onEventClick?.(travelEvent)}
                        className="text-left truncate hover:text-white/100"
                      >
                        {travelEvent.nome}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EVENTOS NORMAIS */}
      <div className="flex flex-col gap-[2px] mt-1">
        {normalEvents.map((event) => (
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
