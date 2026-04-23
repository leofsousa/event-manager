'use client';

import EventList from '@/components/events/event-list';
import EventModal from '@/components/events/event-modal';
import { useState, useEffect } from 'react';
import type { Event } from '@/types/type-event';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/useToast";
import { useRouter } from 'next/navigation';

export default function Eventos() {
  const { showToast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select(`
        *,
        event_shifts ( id )
      `);

    if (error) {
      console.log("Erro ao buscar eventos", error);
      return;
    }

    const eventsWithFlag = (data || []).map((event) => ({
      ...event,
      hasScale: (event.event_shifts || []).length > 0,
    }));

    setEvents(eventsWithFlag);
  };

  useEffect(() => {
    fetchEvents();
  }, []);


  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

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
    router.push('/dashboard/eventos/novo');
  };

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === updatedEvent.id
          ? {
              ...updatedEvent,
              hasScale: event.hasScale,
            }
          : event
      )
    );
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
      comparison =
        new Date(a.data).getTime() -
        new Date(b.data).getTime();
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div>

      <EventList
        events={sortedEvents}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />



      {isModalOpen && (
        <EventModal
          editingEvent={editingEvent}
          onClose={() => {
            setModalOpen(false);
            setEditingEvent(null);
          }}
          onUpdateEvent={handleUpdateEvent}
          onAddEvent={() => { }}
        />
      )}

    </div>
  );
}
