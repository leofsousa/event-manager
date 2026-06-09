"use client";

import { Plus } from "lucide-react";

type Props = {
  colaboradores: any[];
  onAdd?: () => void;
  onEdit: (c: any) => void;
  onDelete: (c: any) => void;

  onSort: (field: "nome" | "cargo") => void;
  sortBy: "nome" | "cargo" | null;
  sortOrder: "asc" | "desc";
};

export default function TableColaboradores({
  colaboradores,
  onAdd,
  onEdit,
  onDelete,
  onSort,
  sortBy,
  sortOrder,
}: Props) {
  return (
    <div>
      <div>
        <span className="text-lg font-semibold text-gray-900 dark:text-white">
          Colaboradores
        </span>
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition"
          onClick={onAdd}
        >
          <Plus size={18} />
          <span>Adicionar</span>
        </button>
      </div>
    </div>
  );
}
