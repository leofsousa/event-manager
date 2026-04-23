'use client';

import type { Event } from '@/types/type-event';
import Button from '@/components/ui/button';

type Props = {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onOpenScale: (id: string) => void;
  isMobile?: boolean;
};

export default function EventRow({
  event,
  onEdit,
  onDelete,
  onOpenScale,
  isMobile
}: Props) {

  if (isMobile) {
    return (
      <div className="bg-white dark:bg-blue-900 rounded-xl p-4 shadow-sm space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {event.nome}
          </h2>

          <span
            className={`text-xs px-2 py-1 rounded
              ${event.hasScale
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
              }`}
          >
            {event.hasScale ? "Com escala" : "Sem escala"}
          </span>
        </div>

        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <p><strong>Tipo:</strong> {event.tipo}</p>
          <p><strong>Data:</strong> {event.data}</p>
          <p><strong>Local:</strong> {event.local}</p>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => onOpenScale(event.id)}
            className={
              event.hasScale
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-green-600 hover:bg-green-500 text-white"
            }
          >
            {event.hasScale ? "Gerenciar escala" : "Criar escala"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => onEdit(event)}
            >
              Editar
            </Button>

            <Button
              variant="danger"
              className="flex-1"
              onClick={() => onDelete(event)}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-blue-950 transition">
      <td className="p-4 font-medium text-gray-900 dark:text-gray-100">
        {event.nome}
      </td>

      <td className="p-4 text-gray-700 dark:text-gray-200">
        {event.tipo}
      </td>

      <td className="p-4 text-gray-700 dark:text-gray-200">
        {event.data}
      </td>

      <td className="p-4 text-gray-700 dark:text-gray-200">
        {event.local}
      </td>

      <td className="p-4 flex justify-end items-center gap-2">

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onOpenScale(event.id);
          }}
          className={
            event.hasScale
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-green-600 hover:bg-green-500 text-white"
          }
        >
          {event.hasScale ? "Gerenciar escala" : "Criar escala"}
        </Button>

        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(event);
          }}
        >
          Editar
        </Button>

        <Button
          variant="danger"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(event);
          }}
        >
          Excluir
        </Button>

      </td>
    </tr>
  );
}
