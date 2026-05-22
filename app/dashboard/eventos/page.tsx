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

  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      setEventsError(null);

      const { data, error } = await supabase.from("events").select(`
          *,
          event_shifts ( id ),
          channels ( sigla ),
          viagem:viagens (
            id,
            nome,
            data_saida,
            data_retorno
          )
        `);

      if (error) {
        throw error;
      }

      const eventsWithFlag = (data || []).map((event: any) => ({
        ...event,
        hasScale: (event.event_shifts || []).length > 0,
        channels: event.channels || null,
        viagem: event.viagem || null,
      }));

      setEvents(eventsWithFlag);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao buscar eventos";
      console.error(errorMessage, err);
      setEventsError(errorMessage);
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

    setEvents((prev) => prev.filter((event) => event.id !== id));
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

    let comparison = 0;

    if (sortBy === "nome") {
      comparison = a.nome.localeCompare(b.nome);
    }

    if (sortBy === "data") {
      comparison = new Date(a.data).getTime() - new Date(b.data).getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="overflow-y-auto p-6">
      {loadingEvents ? (
        <div className="text-gray-700 dark:text-gray-200">
          Carregando eventos...
        </div>
      ) : eventsError ? (
        <div className="text-red-500">
          Erro ao carregar eventos: {eventsError}
        </div>
      ) : (
        <EventList
          events={sortedEvents}
          onDelete={handleDelete}
          onAdd={handleAdd}
          onEdit={handleEdit}
        />
      )}

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
