'use client';

import TableEvents from '@/components/events/table-events';
import { useState } from 'react';

type Event = {
  id: string;
  tipo: string;
  data: string;
  local: string;
};

export default function Eventos() {
  const [events, setEvents] = useState([]);
  const handleDelete = (id: string) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== id));
  };
  return <TableEvents events={events} onDelete={handleDelete} />;
}
