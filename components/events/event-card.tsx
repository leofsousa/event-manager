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

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">

      <div className="mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {event.nome}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-300">
          {event.tipo}
        </p>
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

      <div className="flex flex-wrap gap-2">
        <Button
          className={event.hasScale ? "bg-blue-600 hover:bg-blue-500" : "bg-green-600 hover:bg-green-500"}
          onClick={() => onOpenScale(event.id)}
        >
          {event.hasScale ? "Gerenciar escala" : "Criar escala"}
        </Button>

        <Button
          variant="secondary"
          onClick={() => onEdit(event)}
        >
          Editar
        </Button>

        <Button
          variant="danger"
          onClick={() => onDelete(event)}
        >
          Excluir
        </Button>
      </div>
    </div>
  );
}
