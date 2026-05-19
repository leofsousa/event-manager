"use client";

import type { Event } from "@/types/type-event";

type Props = {
  event: Event;
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

const getChannelBadgeClass = (sigla?: string) => {
  if (!sigla) {
    return "bg-gray-500 text-white";
  }

  return channelStyles[sigla] || "bg-gray-500 text-white";
};

export default function TravelEventItem({ event, onClick }: Props) {
  return (
    <button
      onClick={() => onClick?.(event)}
      className="
    w-full
    min-w-0

    overflow-hidden

    rounded-xl
    border border-purple-200
    bg-white

    px-3 py-2

    text-left
    transition

    hover:bg-purple-50

    dark:border-purple-900
    dark:bg-gray-900
    dark:hover:bg-purple-950/30
  "
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {event.channel?.sigla && (
            <span
              className={`
                rounded
                px-1.5 py-[1px]
                text-[10px]
                font-semibold
                ${getChannelBadgeClass(event.channel.sigla)}
              `}
            >
              {event.channel.sigla}
            </span>
          )}

          <span className="truncate text-xs font-semibold text-gray-900 dark:text-white">
            {event.nome}
          </span>
        </div>

        {event.hora_inicio && (
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {event.hora_inicio}
          </span>
        )}
      </div>
    </button>
  );
}
