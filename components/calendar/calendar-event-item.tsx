import type { Event } from '@/types/type-event';

type Props = {
  event: Event;
  mode: 'admin' | 'viewer';
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

export default function CalendarEventItem({ event }: Props) {
  const sigla = event.channels?.sigla;

  return (
    <div className="flex items-center gap-1 text-[11px] truncate">

      {/* BADGE */}
      {sigla && (
        <span
          className={`px-1 rounded text-white font-semibold ${channelStyles[sigla]}`}
        >
          {sigla}
        </span>
      )}

      {/* NOME */}
      <span className="truncate">
        {event.nome}
      </span>

    </div>
  );
}
