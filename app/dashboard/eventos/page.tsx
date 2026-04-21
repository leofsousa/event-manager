'use client';

import TableEvents from '@/components/events/table-events';
import { useState, useEffect } from 'react';
import type { Event } from '@/types/type-event';
import { supabase } from '@/lib/supabase';
import { useToast } from "@/hooks/useToast";
import { useRouter } from 'next/navigation';

export default function Eventos() {
  const { showToast } = useToast();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*");

      if (error) {
        console.log("Erro ao buscar eventos", error);
        return;
      }

      setEvents(data || []);
    };

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
    router.push(`/dashboard/eventos/${event.id}`);
  };

  const handleAdd = () => {
    router.push('/dashboard/eventos/novo');
  };

  // 🔽 SORT
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
      <TableEvents
        events={sortedEvents}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onSort={handleSort}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onEdit={handleEdit}
      />
    </div>
  );
}
