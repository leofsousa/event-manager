import type { Event } from '@/types/type-event';

type Props = {
  event: Event;
  mode: 'admin' | 'viewer';
  alignRight?: boolean;
  alignTop?: boolean;
  onClick?: (event: Event) => void;
};

const channelStyles: Record<string, string> = {
  CR: "bg-[#a9e22c] text-white",
  CC: "bg-[#d79230] text-white",
  TV: "bg-[#904712] text-white",
  "A+": "bg-[#335a45] text-white",
  RW: "bg-[#006e96] text-white",
  "RW+": "bg-[#37b4d8] text-white",
  CB: "bg-white text-black",
};

export default function CalendarEventItem({
  event,
  alignRight,
  alignTop,
  onClick,
}: Props) {

  const sigla = event.channels?.sigla;
  const isTravel = (event as any).isTravel;

  return (
    <div
      onClick={() => onClick?.(event)}
      className="
        relative group cursor-pointer
        text-[11px] sm:text-[12px]
      "
    >

      {/* ITEM */}
      <div
        className={`
          flex items-center gap-1 px-1.5 py-[2px] rounded
          transition
          
          ${isTravel
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
      >

        {/* BADGE */}
        {!isTravel && sigla && (
          <span
            className={`
              px-1.5 py-[1px] rounded font-semibold
              text-[10px] sm:text-[11px]
              ${channelStyles[sigla]}
            `}
          >
            {sigla}
          </span>
        )}

        {/* VIAGEM ICON */}
        {isTravel && (
          <span className="text-[10px]">
            🚐
          </span>
        )}

        {/* NOME */}
        <span className="truncate">
          {event.nome}
        </span>

      </div>

      {/* TOOLTIP */}
      <div
        className={`
          absolute z-50
          ${alignRight ? 'right-0' : 'left-0'}
          ${alignTop ? 'bottom-full mb-1' : 'top-full mt-1'}
          
          hidden group-hover:block
          
          w-56 p-2 rounded-md shadow-lg
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-700
          text-xs
        `}
      >

        <p className="font-semibold mb-1">
          {event.nome}
        </p>

        <p>📅 {event.data}</p>
        <p>📍 {event.local}</p>

        {sigla && !isTravel && (
          <p>📺 {sigla}</p>
        )}

        {event.tipo && !isTravel && (
          <p>🏷 {event.tipo}</p>
        )}

        {isTravel && (
          <p className="text-purple-500">
            Dia de deslocamento
          </p>
        )}

        {event.observacoes && (
          <p className="mt-1 text-gray-500">
            {event.observacoes}
          </p>
        )}

      </div>

    </div>
  );
}
