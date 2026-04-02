'use client';

import EventModal from '@/components/events/event-modal'
import TableEvents from '@/components/events/table-events';
import { useState } from 'react';
import type { Event } from '@/types/type-event'

export default function Eventos() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const handleAddEvent = (event: Event) => {
    setEvents((prev) => [...prev, event]);
  };

  const handleDelete = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };
  return <div>
    <TableEvents events={events} onDelete={handleDelete} onAdd={() => setModalOpen(true)} />
    {isModalOpen && (
      <EventModal
        onClose={() => setModalOpen(false)}
        onAddEvent={handleAddEvent}
      />
    )}
  </div>;
}
