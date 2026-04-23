'use client';

import type { Event } from "@/types/type-event";
import Button from "@/components/ui/button";

type Props = {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onOpenScale: (id: string) => void;
};

export default function EventCard({
  event,
  onEdit,
  onDelete,
  onOpenScale
}: Props) {
  const channelStyles: Record<string, string> = {
    CR: "bg-[#a9e22c] text-white",
    CC: "bg-[#d79230] text-white",
    TV: "bg-[#904712] text-white",
    "A+": "bg-[#335a45] text-white",
    RW: "bg-[#006e96] text-white",
    "RW+": "bg-[#37b4d8] text-white",
    CB: "bg-white text-black",
  };

  const channelSigla = event.channels?.sigla;

  return (
    <div className="
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-xl p-4 shadow-sm hover:shadow-md
      transition flex flex-col justify-between
    ">
      <div className="mb-3 flex items-start justify-between gap-2">

        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.nome}
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-300">
            {event.tipo}
          </p>
        </div>

        {/* 📌 CHANNEL BADGE (NOVO) */}
        {channelSigla && (
          <span className={`
          text-[11px] px-2 py-1 rounded-md
          font-semibold whitespace-nowrap
          ${channelStyles[channelSigla] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"}
        `}>
            {channelSigla}
          </span>
        )}

      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
        <p>📅 {event.data}</p>
        <p>📍 {event.local}</p>
      </div>

      <div className="mb-4">
        {event.hasScale ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            Com escala
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
            Sem escala
          </span>
        )}
      </div>

      <div className="
        flex flex-col sm:flex-row
        gap-2 sm:gap-2
      ">
        <Button
          className={
            event.hasScale
              ? "bg-blue-600 hover:bg-blue-500"
              : "bg-green-600 hover:bg-green-500"
          }
          onClick={() => onOpenScale(event.id)}
        >
          {event.hasScale ? "Gerenciar escala" : "Criar escala"}
        </Button>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="secondary"
            className="flex-1 sm:flex-none"
            onClick={() => onEdit(event)}
          >
            Editar
          </Button>

          <Button
            variant="danger"
            className="flex-1 sm:flex-none"
            onClick={() => onDelete(event)}
          >
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
}
