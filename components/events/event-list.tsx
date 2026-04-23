'use client';

import { Plus } from 'lucide-react';
import type { Event } from '@/types/type-event';
import { useState } from 'react';
import ConfirmModal from "@/components/ui/confirm-modal";
import Button from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import EventCard from "./event-card";

type Props = {
  events: Event[];
  onDelete: (id: string) => void;
  onAdd: () => void;
  onEdit: (event: Event) => void;
};

export default function EventList({
    events,
    onDelete,
    onAdd,
    onEdit
}:Props) {
    const router = useRouter();
    const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  
    const groupEventsByDate = (events: Event[]) => {
      const groups: Record<string, Event[]> = {};
    
      events.forEach((event) => {
        const date = event.data; // ✅ corrigido
    
        if (!groups[date]) {
          groups[date] = [];
        }
    
        groups[date].push(event);
      });
    
      return groups;
    };
    
    const formatMonth = (date: string) => {
      return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    };
    
    const formatDay = (date: string) => {
      return new Date(date + "T00:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        weekday: "long",
      });
    };
    
    const grouped = groupEventsByDate(events);
    const dates = Object.keys(grouped).sort();
    
  
    let currentMonth = "";
  
    return (
      <>
        <div className="bg-white dark:bg-blue-900 rounded-xl shadow-sm">
  
          {/* HEADER */}
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lista de Eventos
            </h2>
  
            <Button onClick={onAdd} className="flex items-center gap-2">
              <Plus size={18} />
              Adicionar Evento
            </Button>
          </div>
  
          {/* LISTA */}
          <div className="p-4 space-y-6">
            {dates.map((date) => {
              const month = formatMonth(date);
              const showMonth = month !== currentMonth;
              currentMonth = month;
  
              return (
                <div key={date}>
  
                  {/* MÊS */}
                  {showMonth && (
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                      {month}
                    </h2>
                  )}
  
                  {/* DIA */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatDay(date)}
                    </span>
                    <div className="h-px flex-1 bg-gray-300 dark:bg-gray-600" />
                  </div>
  
                  {/* GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {grouped[date].map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        onEdit={onEdit}
                        onDelete={setEventToDelete}
                        onOpenScale={(id) =>
                          router.push(`/dashboard/eventos/${id}`)
                        }
                      />
                    ))}
                  </div>
  
                </div>
              );
            })}
          </div>
        </div>
  
        {eventToDelete && (
          <ConfirmModal
            title="Excluir Evento"
            description={`Tem certeza que deseja excluir "${eventToDelete.nome}"?`}
            onCancel={() => setEventToDelete(null)}
            onConfirm={() => {
              onDelete(eventToDelete.id);
              setEventToDelete(null);
            }}
          />
        )}
      </>
    );
  }