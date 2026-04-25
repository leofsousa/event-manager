import type { Event } from '@/types/type-event';

type Props = {
    event: Event;
    mode: 'admin' | 'viewer';
    alignRight?: boolean;
    alignTop?: boolean;

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

export default function CalendarEventItem({ event, alignRight, alignTop }: Props) {
    const sigla = event.channels?.sigla;

    return (
        <div className="relative group flex items-center gap-1 text-[11px] ">

            {/* BADGE */}
            {sigla && (
                <span
                    className={`px-1 rounded font-semibold ${channelStyles[sigla]}`}
                >
                    {sigla}
                </span>
            )}

            {/* NOME */}
            <span className="truncate">
                {event.nome}
            </span>

            <div
                className={`
        absolute top-full mt-1
        ${alignRight ? 'right-0' : 'left-0'}
        hidden group-hover:block
        z-50
        w-56 p-2 rounded-md shadow-lg
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-700
        text-xs
      `}
            >
                <p className="font-semibold">{event.nome}</p>

                <p className="text-gray-600 dark:text-gray-300">
                    📍 {event.local}
                </p>

                <p className="text-gray-600 dark:text-gray-300">
                    📅 {event.data}
                </p>

                {sigla && (
                    <p className="text-gray-600 dark:text-gray-300">
                        📺 {sigla}
                    </p>
                )}

                {event.tipo && (
                    <p className="text-gray-600 dark:text-gray-300">
                        🏷 {event.tipo}
                    </p>
                )}
            </div>

        </div>
    );
}
