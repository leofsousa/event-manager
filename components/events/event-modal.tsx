"use client";

import Event from "@/types/event.ts";
import { useState } from "react";
import Input from "@/components/ui/input.tsx";

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
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold m-6 text-gray-900">Novo Evento</h2>
        <div>
          <Input
            type="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <Input
            type="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
        </div>

        <button
          className="m-6 rounded-xl bg-blue-600 p-2 hover:bg-blue-300 transition"
          onClick={onClose}
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
