import type { Event } from '@/types/type-event';

type Props = {
  event: Event;
  mode: 'admin' | 'colaborador';
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

  const sigla = event.channel?.sigla;

  const isTravelBlock = event.isTravelBlock;
  const isTravel = event.isTravel;

  return (
    <div
      onClick={() => !isTravelBlock && onClick?.(event)}
      className="relative group cursor-pointer text-[11px] sm:text-[12px]"
    >

      {/* ITEM */}
      <div
        className={`
          flex items-center gap-1 px-1.5 py-[2px] rounded
          transition

          ${
            isTravelBlock
              ? 'bg-purple-200 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-semibold'
              : isTravel
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }
        `}
      >

        {/* VIAGEM BLOCO */}
        {isTravelBlock && (
          <span className="text-[10px]">
            🚐
          </span>
        )}

        {/* BADGE CANAL */}
        {!isTravelBlock && !isTravel && sigla && (
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

        {/* ÍCONE VIAGEM (fallback) */}
        {isTravel && !isTravelBlock && (
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

        {/* VIAGEM BLOCO */}
        {isTravelBlock ? (
          <>
            <p className="text-purple-500 font-medium">
              🚐 Viagem
            </p>

            {event.viagem?.data_saida && event.viagem?.data_retorno && (
              <p>
                {event.viagem.data_saida} → {event.viagem.data_retorno}
              </p>
            )}
          </>
        ) : (
          <>
            <p>📅 {event.data}</p>
            <p>📍 {event.local}</p>

            {sigla && (
              <p>📺 {sigla}</p>
            )}

            {event.tipo && (
              <p>🏷 {event.tipo}</p>
            )}
          </>
        )}

        {/* OBS */}
        {event.observacoes && !isTravelBlock && (
          <p className="mt-1 text-gray-500">
            {event.observacoes}
          </p>
        )}

      </div>

    </div>
  );
}
