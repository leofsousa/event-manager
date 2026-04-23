'use client';

import { Plus } from 'lucide-react';
import type { Event } from '@/types/type-event'
import { useState } from "react";
import ConfirmModal from "@/components/ui/confirm-modal";
import Button from "@/components/ui/button";
import { useRouter } from 'next/navigation';



type Props = {
  events: Event[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSort: (field: "nome" | "data") => void;
  sortBy: "nome" | "data" | null;
  sortOrder: "asc" | "desc";
  onEdit: (event: Event) => void
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
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const router = useRouter();

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-blue-900">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-blue-950">
            <tr>
              <th colSpan={5} className="p-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    Lista de Eventos
                  </span>

                  <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition" onClick={onAdd}>
                    <Plus size={18} />
                    <span>Adicionar Evento</span>
                  </button>
                </div>
              </th>
            </tr>
            <tr>
              <th onClick={() => onSort("nome")}
                className="text-left p-4 text-sm font-medium text-gray-600 cursor-pointer">
                Nome {sortBy === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>

              <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Tipo
              </th>
              <th onClick={() => onSort("data")} className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300 cursor-pointer">
                Data {sortBy === "data" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Local
              </th>
              <th className="text-right p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                Ações
              </th>
            </tr>
          </thead>

          <tbody>
            {events.map((event) => (
              <tr
                key={event.id}
                className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-blue-950 transition"
              >
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

                  {/* BOTÃO ESCALA */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/eventos/${event.id}`);
                    }}
                    className={`
    ${event.hasScale
                        ? "bg-blue-600 hover:bg-blue-500 text-white"
                        : "bg-green-600 hover:bg-green-500 text-white"
                      }
  `}
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
                      setEventToDelete(event);
                    }}
                  >
                    Excluir
                  </Button>

                </td>


              </tr>
            ))}
          </tbody>

        </table>
      </div>
      {eventToDelete && (
        <ConfirmModal
          title="Excluir Evento"
          description={`Tem certeza que deseja excluir "${eventToDelete.nome}"?`}
          onCancel={() => setEventToDelete(null)}
          onConfirm={() => {
            onDelete(eventToDelete.id)
            setEventToDelete(null)
          }}
        />

      )}
    </>);
}
