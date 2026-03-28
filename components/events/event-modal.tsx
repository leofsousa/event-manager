"use client";

import Event from "@/types/event.ts";
import { useState } from "react";
import Input from "@/components/ui/input.tsx";
import InputDate from "@/components/ui/input-date.tsx";
import Button from "@/components/ui/button.tsx";

type Props = {
  onClose: () => void;
  onAddEvent: (event: Event) => void;
};

export default function EventModal({ onClose }: Props) {
  const handleSubmit = () => {
    if (!nome || !tipo || !data || !local) {
      alert("Preencha todos os campos");
      return;
    }
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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold m-6 text-gray-900">Novo Evento</h2>
        <div className="flex flex-col gap-2">
          <div>
            <label className="text-gray-900">Nome</label>
            <Input
              type="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div>
            <label className="text-gray-900">Tipo</label>
            <Input
              type="tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          </div>
          <div>
            <label className="text-gray-900">Data</label>
            <InputDate value={data} onChange={setData} />
          </div>
          <div>
            <label className="text-gray-900">Local</label>
            <Input
              type="local"
              value={local}
              onChange={(e) => setLocal(e.target.value)}
            />
          </div>
        </div>
        <div className="p-5 flex justify-between gap-2">
          <Button onClick={onClose} variant="danger">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Adicionar Evento</Button>
        </div>
      </div>
    </div>
  );
}
