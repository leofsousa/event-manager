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
  const validate = () => {
    const newErrors = {
      nome: "",
      tipo: "",
      data: "",
      local: "",
    };

    if (!nome.trim()) newErrors.nome = "Nome é obrigatório";
    if (!tipo.trim()) newErrors.tipo = "Tipo é obrigatório";
    if (!data.trim()) newErrors.data = "Data é obrigatória";
    if (!local.trim()) newErrors.local = "Local é obrigatório";

    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === "");
  };


  const handleSubmit = () => {
    const isValid = validate();

    if (!isValid) return;

    const newEvent: Event = {
      id: crypto.randomUUID(),
      nome,
      tipo,
      data,
      local,
    };
    onAddEvent(newEvent);
    onClose();
  };

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [errors, setErrors] = useState({
    nome: "",
    tipo: "",
    data: "",
    local: "",
  })


  const isFormValid =
    nome.trim() &&
    tipo.trim() &&
    data.trim() &&
    local.trim();


  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold m-4 text-gray-900">Novo Evento</h2>
        <div className="flex flex-col gap-4">
          <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
            <Input
              type="text"
              value={nome}
              error={!errors.nome}
              onChange={(e) => {
                setNome(e.target.value);

                if (errors.nome) {
                  setErrors((prev) => ({ ...prev, nome: "" }));
                }
              }}
            />
          </FormField>
          <FormField label="Tipo" htmlFor="tipo" required errors={errors.tipo}>
            <Input
              type="text"
              value={tipo}
              error={!errors.tipo}
              onChange={(e) => {
                setTipo(e.target.value);

                if (errors.tipo) {
                  setErrors((prev) => ({ ...prev, tipo: "" }));
                }
              }}
            />
          </FormField>
          <FormField label="Data" htmlFor="data" required errors={errors.data}>
            <InputDate value={data} onChange={setData} />
          </FormField>
          <FormField label="Local" htmlFor="local" required errors={errors.local}>
            <Input
              type="text"
              value={local}
              error={!errors.local}
              onChange={(e) => {
                setLocal(e.target.value);

                if (errors.local) {
                  setErrors((prev) => ({ ...prev, local: "" }));
                }
              }}
            />
          </FormField>
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
