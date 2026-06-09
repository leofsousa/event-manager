"use client";

import EventList from "@/components/events/event-list";
import EventModal from "@/components/events/event-modal";
import { useCallback, useEffect, useState } from "react";
import type { Event } from "@/types/type-event";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export default function Eventos() {
  const { showToast } = useToast();
  const router = useRouter();

  const [isExportModalOpen, setExportModalOpen] = useState(false);
  const [exportMonth, setExportMonth] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  // Load user role once
  useEffect(() => {
    const fetchRole = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;
      const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      if (!pErr) setUserRole(profile?.role ?? null);
    };
    fetchRole();
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError(null);
      const { data, error } = await supabase.from("events").select(`
        *,
        event_shifts ( id ),
        channels ( sigla ),
        creator:profiles!events_created_by_fkey(username, email),
        viagem:viagens (
          id,
          nome,
          data_saida,
          data_retorno
        )
      `);
      if (error) throw error;
      const eventsWithFlag = (data || []).map((event: any) => ({
        ...event,
        hasScale: (event.event_shifts || []).length > 0,
        channels: event.channels || null,
        viagem: event.viagem || null,
      }));
      setEvents(eventsWithFlag);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao buscar eventos";
      console.error(msg, err);
      setEventsError(msg);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error(error);
      return;
    }
    setEvents((prev) => prev.filter((e) => e.id !== id));
    showToast("Evento deletado com sucesso!");
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const handleAdd = () => {
    router.push("/dashboard/eventos/novo");
  };

  const handleAddEvent = async (newEvent: Event) => {
    await fetchEvents();
  };

  const handleUpdateEvent = async (updatedEvent: Event) => {
    await fetchEvents();
  };

  const [sortBy, setSortBy] = useState<"nome" | "data" | null>("nome");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "nome" | "data") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const sortedEvents = [...events].sort((a, b) => {
    if (!sortBy) return 0;
    let comp = 0;
    if (sortBy === "nome") comp = a.nome.localeCompare(b.nome);
    if (sortBy === "data") comp = new Date(a.data).getTime() - new Date(b.data).getTime();
    return sortOrder === "asc" ? comp : -comp;
  });

  return (
    <div className="relative">
      {/* Export button – visible only for admin */}
      {userRole === 'admin' && (
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setExportModalOpen(true)}
          >
            Exportar Agenda
          </button>
        </div>
      )}

      {/* Export Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg w-80">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Selecionar Mês para Exportar
            </h2>
            <input
              type="month"
              value={exportMonth}
              onChange={(e) => setExportMonth(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                onClick={() => setExportModalOpen(false)}
              >Cancelar</button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={async () => {
                  if (!exportMonth) {
                    showToast('Selecione um mês');
                    return;
                  }
                  try {
                    const res = await fetch(`/api/export-agenda?month=${exportMonth}`);
                    if (!res.ok) {
                      const err = await res.json();
                      throw new Error(err.error || 'Erro ao exportar');
                    }
                    const blob = await res.blob();
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `agenda-${exportMonth}.xlsx`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Exportação concluída');
                    setExportModalOpen(false);
                  } catch (e: any) {
                    console.error(e);
                    showToast(e.message ?? 'Erro na exportação');
                  }
                }}
              >Exportar</button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="overflow-y-auto p-6">
        {loadingEvents ? (
          <div className="text-gray-700 dark:text-gray-200">Carregando eventos...</div>
        ) : eventsError ? (
          <div className="text-red-500">Erro ao carregar eventos: {eventsError}</div>
        ) : (
          <EventList
            events={sortedEvents}
            onDelete={handleDelete}
            onAdd={handleAdd}
            onEdit={handleEdit}
          />
        )}
      </div>

      {/* Edit modal */}
      {isModalOpen && (
        <EventModal
          editingEvent={editingEvent}
          onClose={() => {
            setModalOpen(false);
            setEditingEvent(null);
          }}
          onUpdateEvent={handleUpdateEvent}
          onAddEvent={handleAddEvent}
        />
      )}
    </div>
  );
}
