"use client";

import { Plus, User, Edit2, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

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
  const renderSortIcon = (field: "nome" | "cargo") => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} className="opacity-50" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="text-blue-500" />
    ) : (
      <ArrowDown size={14} className="text-blue-500" />
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Colaboradores ({colaboradores.length})
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gerenciamento da equipe de colaboradores e permissões
          </p>
        </div>
        <button
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-500 transition font-medium text-sm self-start sm:self-auto"
          onClick={onAdd}
        >
          <Plus size={18} />
          <span>Novo Colaborador</span>
        </button>
      </div>

      {/* Sorting Bar */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
        <span className="font-medium">Ordenar por:</span>
        <button
          onClick={() => onSort("nome")}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition ${
            sortBy === "nome"
              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100"
          }`}
        >
          <span>Nome</span>
          {renderSortIcon("nome")}
        </button>
        <button
          onClick={() => onSort("cargo")}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg border transition ${
            sortBy === "cargo"
              ? "bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-950/30 dark:border-blue-900 dark:text-blue-400"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 hover:bg-gray-100"
          }`}
        >
          <span>Cargo</span>
          {renderSortIcon("cargo")}
        </button>
      </div>

      {/* Grid List */}
      {colaboradores.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          <User size={48} className="text-gray-400 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Nenhum colaborador encontrado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {colaboradores.map((colab) => {
            const isDefaultAvatar = !colab.avatar_url;
            return (
              <div
                key={colab.id}
                className="flex flex-col justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition duration-200"
              >
                <div>
                  {/* Card Header with Photo and Perfil Role */}
                  <div className="flex items-start justify-between mb-4">
                    {colab.avatar_url ? (
                      <img
                        src={colab.avatar_url}
                        alt={colab.username}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-800 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">
                        {colab.username ? colab.username.charAt(0).toUpperCase() : "?"}
                      </div>
                    )}

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                        colab.role === "admin"
                          ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
                          : "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                      }`}
                    >
                      {colab.role === "admin" ? "Admin" : "Colaborador"}
                    </span>
                  </div>

                  {/* Collaborator Info */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-base truncate">
                      {colab.username}
                    </h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {colab.cargo || "Sem cargo"}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-2">
                      {colab.email || "Sem e-mail"}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => onEdit(colab)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    <Edit2 size={12} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => onDelete(colab)}
                    className="flex items-center justify-center p-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
