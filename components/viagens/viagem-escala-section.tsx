"use client";

import EventColaboradoresSelect from "@/components/events/event-colaboradores-select";

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
};

export default function ViagemEscalaSection({ selected, onChange }: Props) {
  return (
    <EventColaboradoresSelect selected={selected} onChange={onChange} />
  );
}
