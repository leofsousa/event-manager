'use client';

import EventModal from '@/components/events/event-modal'
import TableEvents from '@/components/events/table-events';
import { useState, useEffect } from 'react';
import type { Event } from '@/types/type-event'
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/useToast"

export default function Eventos() {
  const {showToast} = useToast();
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")

      if (error) {
        console.log("Erro ao buscar eventos", error);
        return;
      }

      setEvents(data || [])
    };
    fetchEvents();
  }, [])

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event)
    )
  }

  const handleEdit = (event: Event) => {
    setEditingEvent(event)
    setModalOpen(true)
  }

  const [isModalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const handleAddEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);

    if (error) {
      console.error(error);
      return
    }
    setEvents((prev) => prev.filter((event) => event.id !== id));
    showToast("Evento Deletado com sucesso!")
  };

  const [sortBy, setSortBy] = useState<"nome" | "data" | null>("nome");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const handleSort = (field: "nome" | "data") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    } else {
      setSortBy(field);
      setSortOrder("asc")
    }
  }

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

  return <div>
    <TableEvents
      events={sortedEvents}
      onDelete={handleDelete}
      onAdd={() => setModalOpen(true)}
      onSort={handleSort}
      sortBy={sortBy}
      sortOrder={sortOrder}
      onEdit={handleEdit}
    />
    {isModalOpen && (
      <EventModal
        onClose={() => {
          setModalOpen(false)
          setEditingEvent(null)
        }}
        onAddEvent={handleAddEvent}
        onUpdateEvent={handleUpdateEvent}
        editingEvent={editingEvent}
      />
    )}
  </div>;
}
