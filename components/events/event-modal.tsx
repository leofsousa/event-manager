"use client";

import Event from "@/types/event.ts";
import { useState } from "react";
import Input from "@/components/ui/input.tsx";
import InputDate from "@/components/ui/input-date.tsx";
import Button from "@/components/ui/button.tsx";
import FormField from '@/components/events/form-field.tsx'

type Props = {
  onClose: () => void;
  onAddEvent: (event: Event) => void;
};

export default function EventModal({ onClose, onAddEvent }: Props) {
  const handleSubmit = () => {
    const newEvent: Event = {
      id: crypto.randomUUID(),
      nome,
      tipo,
      data,
      local,
    };
    onAddNewEvent(newEvent);
    onClose();
  };

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");

  const isFormValid = nome && tipo && data && local;


  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold m-4 text-gray-900">Novo Evento</h2>
        <div className="flex flex-col gap-4">
          <div>
            <FormField label="Nome" htmlFor="nome" required>
              <Input
                type="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormField>
          </div>
          <div>
            <FormField label="Tipo" htmlFor="tipo" required>
              <Input
                type="tipo"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
            </FormField>
          </div>
          <div>
            <FormField label="Data" htmlFor="data" required>

              <InputDate value={data} onChange={setData} />
            </FormField>
          </div>
          <div>
            <FormField label="Local" htmlFor="local" required>
              <Input
                type="local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </FormField>
          </div>
        </div>
        <div className="p-5 flex justify-between gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} type="submit" disabled={!isFormValid}>Salvar</Button>
        </div>
      </div>
    </div>
  );
}
