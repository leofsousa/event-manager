import CalendarEventItem from './calendar-event-item';
import type { Event } from '@/types/type-event';

type Props = {
  date: Date;
  events: Event[];
  mode: 'admin' | 'colaborador';
  travelPosition?: 'start' | 'middle' | 'end' | null;
};

export default function CalendarDayCell({
  date,
  events,
  mode,
  travelPosition,
}: Props) {

  const dateStr = date.toLocaleDateString('pt-BR');

  // separa viagem do resto
  const travelBlock = events.find((e) => e.isTravelBlock);
  const normalEvents = events.filter((e) => !e.isTravelBlock);

  return (
    <div className="flex flex-col border rounded-xl p-2 min-h-[100px] bg-white dark:bg-gray-800">

      {/* DATA */}
      <div className="text-xs font-semibold text-gray-500 mb-1">
        {dateStr}
      </div>

      {/* 🔥 BLOCO DE VIAGEM CONTÍNUO */}
      {travelBlock && (
        <div
          className={`
            flex items-center gap-1 px-2 py-[3px]
            text-[11px] font-semibold
            bg-purple-200 text-purple-800
            dark:bg-purple-900/40 dark:text-purple-300

            ${
              travelPosition === 'start'
                ? 'rounded-l-lg'
                : travelPosition === 'end'
                ? 'rounded-r-lg'
                : 'rounded-none'
            }
          `}
        >
          {/* só mostra ícone no começo */}
          {travelPosition === 'start' && <span>🚐</span>}

          {/* só mostra nome no começo */}
          {travelPosition === 'start' && (
            <span className="truncate">
              {travelBlock.nome}
            </span>
          )}
        </div>
      )}

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
