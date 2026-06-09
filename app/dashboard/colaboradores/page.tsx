"use client";

import { useEffect, useState } from "react";

import TableColaboradores from "@/components/colaboradores/table-colaboradores";
import ColaboradorModal from "@/components/colaboradores/colaboradores-modal";
import ConfirmModal from "@/components/ui/confirm-modal";

import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/input";

type Colaborador = {
  id: string;
  username: string;
  cargo?: string;
  role: string;
};

export default function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedColaborator, setSelectedColaborator] =
    useState<Colaborador | null>(null);

  const [colaboradorToDelete, setColaboradorToDelete] =
    useState<Colaborador | null>(null);

  const [sortBy, setSortBy] = useState<"nome" | "cargo" | null>("nome");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

// Filters
const [filterName, setFilterName] = useState("");
const [filterCargo, setFilterCargo] = useState("");

  const handleSort = (field: "nome" | "cargo") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortBy(field);
    setSortOrder("asc");
  };

  const sortedColaboradores = [...colaboradores].sort((a, b) => {
    if (!sortBy) return 0;

    let comparison = 0;

    if (sortBy === "nome") {
      comparison = (a.username || "").localeCompare(b.username || "");
    }

    if (sortBy === "cargo") {
      comparison = (a.cargo || "").localeCompare(b.cargo || "");
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });
const filteredColaboradores = sortedColaboradores.filter((c) => {
  const matchesName = c.username ? c.username.toLowerCase().includes(filterName.toLowerCase()) : false;
  const matchesCargo = filterCargo ? c.cargo === filterCargo : true;
  return matchesName && matchesCargo;
});

  const fetchColaboradores = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("username", { ascending: true });

      if (error) {
        throw error;
      }

      setColaboradores(data || []);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erro inesperado ao buscar colaboradores";
      console.error(errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const handleEdit = (colaborador: Colaborador) => {
    setSelectedColaborator(colaborador);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!colaboradorToDelete) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", colaboradorToDelete.id);

      if (error) {
        throw error;
      }

      setColaboradorToDelete(null);
      await fetchColaboradores();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro inesperado ao excluir";
      console.error(errorMessage, err);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Carregando colaboradores...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
{/* Filters */}
<div className="flex flex-col sm:flex-row gap-4 mb-4">
  <Input
    placeholder="Filtrar por nome"
    value={filterName}
    onChange={(e) => setFilterName(e.target.value)}
  />
  <select
    className="w-full sm:w-48 px-3 py-2 border rounded-md bg-white dark:bg-gray-800"
    value={filterCargo}
    onChange={(e) => setFilterCargo(e.target.value)}
  >
    <option value="">Todos os cargos</option>
    {Array.from(new Set(colaboradores.map((c) => c.cargo).filter(Boolean))).map((cargo) => (
      <option key={cargo} value={cargo}>
        {cargo}
      </option>
    ))}
  </select>
</div>
<TableColaboradores
  colaboradores={filteredColaboradores}
  onAdd={() => {
    setSelectedColaborator(null);
    setIsModalOpen(true);
  }}
  onEdit={handleEdit}
  onDelete={(c) => setColaboradorToDelete(c)}
  onSort={handleSort}
  sortBy={sortBy}
  sortOrder={sortOrder}
/>


      {isModalOpen && (
        <ColaboradorModal
          colaborador={selectedColaborator}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchColaboradores}
        />
      )}

      {colaboradorToDelete && (
        <ConfirmModal
          title="Excluir colaborador"
          description={`Tem certeza que deseja excluir ${colaboradorToDelete.username}?`}
          onConfirm={handleDelete}
          onCancel={() => setColaboradorToDelete(null)}
        />
      )}
    </div>
  );
}
