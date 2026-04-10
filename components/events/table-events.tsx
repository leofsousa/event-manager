'use client';

import { Plus } from 'lucide-react';
import type { Event } from '@/types/type-event'

type Props = {
  events: Event[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSort: (field: "nome" | "data") => void;
  sortBy: "nome"| "data" | null;
  sortOrder: "asc" | "desc";
};

export default function TableEvents({
  events,
  onDelete,
  onAdd,
  onSort,
  sortBy,
  sortOrder }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-blue-900">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th colSpan={5} className="p-4">
              <div className="flex items-center justify-between w-full">
                <span className="text-lg font-semibold text-gray-900">
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

            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Tipo
            </th>
            <th onClick={() => onSort("data")} className="cursor-pointer">
              Data {sortBy === "data" && (sortOrder === "asc" ? "↑" : "↓")}
            </th>
            <th className="text-left p-4 text-sm font-medium text-gray-600">
              Local
            </th>
            <th className="text-right p-4 text-sm font-medium text-gray-600">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {events.map((event) => (
            <tr key={event.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-4 font-medium text-gray-900">{event.nome}</td>

              <td className="p-4">{event.tipo}</td>
              <td className="p-4">{event.data}</td>
              <td className="p-4">{event.local}</td>

              <td className="p-4 text-right">
                <button
                  onClick={() => onDelete(event.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
