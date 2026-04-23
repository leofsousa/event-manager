'use client';

import { Plus } from 'lucide-react';
import type { Event } from '@/types/type-event';
import { useState } from "react";
import ConfirmModal from "@/components/ui/confirm-modal";
import Button from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import EventRow from "@/components/events/event-row";

type Props = {
  events: Event[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSort: (field: "nome" | "data") => void;
  sortBy: "nome" | "data" | null;
  sortOrder: "asc" | "desc";
  onEdit: (event: Event) => void;
};

export default function TableEvents({
  events,
  onDelete,
  onAdd,
  onSort,
  sortBy,
  sortOrder,
  onEdit
}: Props) {
  const groupEventsByDate = (events: Event[]) => {
    const groups: Record<string, Event[]> = {};

    events.forEach((event) => {
      const date = new Date(event.data).toISOString().split("T")[0];

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(event);
    });

    return groups;
  };

  const formatMonth = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
  };
  
  const formatDay = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      weekday: "long",
    });
  };
  

  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-blue-900">

        <div className="p-4 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            Lista de Eventos
          </span>

          <Button onClick={onAdd} className="flex items-center gap-2">
            <Plus size={18} />
            Adicionar Evento
          </Button>
        </div>

        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-blue-950">
              <tr>
                <th
                  onClick={() => onSort("nome")}
                  className="text-left p-4 text-sm font-medium cursor-pointer"
                >
                  Nome {sortBy === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Tipo
                </th>

                <th
                  onClick={() => onSort("data")}
                  className="text-left p-4 text-sm font-medium cursor-pointer"
                >
                  Data {sortBy === "data" && (sortOrder === "asc" ? "↑" : "↓")}
                </th>

                <th className="text-left p-4 text-sm font-medium">
                  Local
                </th>

                <th className="text-right p-4 text-sm font-medium">
                  Ações
                </th>
              </tr>
            </thead>

            <tbody>
  {(() => {
    const grouped = groupEventsByDate(events);
    const dates = Object.keys(grouped).sort();

    let currentMonth = "";

    return dates.map((date) => {
      const month = formatMonth(date);
      const showMonth = month !== currentMonth;
      currentMonth = month;

      return (
        <>
          {/* MÊS */}
          {showMonth && (
            <tr>
              <td colSpan={5} className="bg-gray-200 dark:bg-blue-950 px-4 py-2 font-bold text-gray-800 dark:text-white">
                {month}
              </td>
            </tr>
          )}

          {/* DIA */}
          <tr>
            <td colSpan={5} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">
              {formatDay(date)}
            </td>
          </tr>

          {/* EVENTOS */}
          {grouped[date].map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={setEventToDelete}
              onOpenScale={(id) => router.push(`/dashboard/eventos/${id}`)}
            />
          ))}
        </>
      );
    });
  })()}
</tbody>

          </table>
        </div>

        {/* MOBILE */}
        <div className="md:hidden flex flex-col gap-4 p-4">
  {(() => {
    const grouped = groupEventsByDate(events);
    const dates = Object.keys(grouped).sort();

    let currentMonth = "";

    return dates.map((date) => {
      const month = formatMonth(date);
      const showMonth = month !== currentMonth;
      currentMonth = month;

      return (
        <div key={date}>

          {showMonth && (
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
              {month}
            </h2>
          )}

          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {formatDay(date)}
            </span>
            <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
          </div>

          <div className="flex flex-col gap-3">
            {grouped[date].map((event) => (
              <EventRow
                key={event.id}
                event={event}
                isMobile
                onEdit={onEdit}
                onDelete={setEventToDelete}
                onOpenScale={(id) => router.push(`/dashboard/eventos/${id}`)}
              />
            ))}
          </div>

        </div>
      );
    });
  })()}
</div>

      </div>

      {eventToDelete && (
        <ConfirmModal
          title="Excluir Evento"
          description={`Tem certeza que deseja excluir "${eventToDelete.nome}"?`}
          onCancel={() => setEventToDelete(null)}
          onConfirm={() => {
            onDelete(eventToDelete.id);
            setEventToDelete(null);
          }}
        />
      )}
    </>
  );
}
