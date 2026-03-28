'use client';

import EventModal from '@/components/events/event-modal.tsx'
import TableEvents from '@/components/events/table-events';
import { useState } from 'react';
import Event from '@/types/events.ts'

type Event = {
  id: string;
  tipo: string;
  data: string;
  local: string;
};

export default function Eventos() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const handleDelete = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };
  return <div>
    <TableEvents events={events} onDelete={handleDelete} onAdd={() => setModalOpen(true)} />
    {isModalOpen && (<EventModal onClose={() => setModalOpen(false)} />)}
  </div>;
}
