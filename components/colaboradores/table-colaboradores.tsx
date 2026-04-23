'use client';

import { Plus } from 'lucide-react';

type Props = {
    colaboradores: any[];
    onAdd?: () => void;
    onEdit: (c: any) => void;
    onDelete: (c: any) => void;

    onSort: (field: "nome" | "cargo") => void;
    sortBy: "nome" | "cargo" | null;
    sortOrder: "asc" | "desc";
}

export default function TableColaboradores({
    colaboradores,
    onAdd,
    onEdit,
    onDelete,
    onSort,
    sortBy,
    sortOrder
}: Props) {
    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden dark:bg-blue-900">
            <table className="w-full">
                <thead className="bg-gray-100 dark:bg-blue-950">
                    <tr>
                        <th colSpan={3} className="p-4">
                            <div className="flex items-center justify-between w-full">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Colaboradores
                                </span>
                                <button className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-500 transition" onClick={onAdd}>
                                    <Plus size={18} />
                                    <span>Adicionar</span>
                                </button>
                            </div>
                        </th>
                    </tr>
                    <tr>
                        <th
                            className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300"
                            onClick={() => onSort("nome")}>
                                Nome {sortBy === "nome" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th 
                        className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300"
                        onClick={() => onSort("cargo")}
                        >Cargo {sortBy ===  "cargo" && (sortOrder === "asc" ? "↑" : "↓")}
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {colaboradores.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="p-4 text-center text-gray-500 dark:text-gray-400">Nenhum colaborador encontrado</td>
                        </tr>
                    ) : (colaboradores.map((c) => (
                        <tr key={c.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-blue-950 transition cursor-pointer" onClick={() => onEdit(c)}>
                            <td className="p-4 font-medium text-gray-900 dark:text-gray-100">{c.username}</td>
                            <td className="p-4 text-gray-700 dark:text-gray-200">{c.cargo || '-'}</td>

                            <td className="p-4 flex justify-end items-center gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(c);
                                    }}
                                    className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100 transition"
                                >
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    ))
                    )}
                </tbody>
            </table>
        </div>
    )
}