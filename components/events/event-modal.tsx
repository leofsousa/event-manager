"use client";

import type { Event } from "@/types/type-event";
import { useState, useEffect } from "react";
import Input from "@/components/ui/input";
import InputDate from "@/components/ui/input-date";
import Button from "@/components/ui/button";
import FormField from '@/components/events/form-field'
import Select from "@/components/ui/select";
import CreateTypeModal from "./create-type-modal";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";


type Props = {
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  editingEvent?: Event | null;
  onUpdateEvent: (event: Event) => void
};

export default function EventModal({
  onClose,
  onAddEvent,
  onUpdateEvent,
  editingEvent }: Props) {

  const { showToast } = useToast();
  useEffect(() => {
    const fetchTypes = async () => {
      const { data, error } = await supabase
        .from("event_types")
        .select("*");
  
      if (error) {
        console.error(error);
        return;
      }
  
      setEventTypes(data);
    };
  
    fetchTypes();
  }, []);
  
  const handleCreateType = async (name: string) => {
    const formatted = name.toLowerCase().trim();
  
    const { data, error } = await supabase
      .from("event_types")
      .insert([
        {
          label: name,
          value: formatted,
        },
      ])
      .select()
      .single();
  
    if (error) {
      console.error(error);
      showToast("Erro ao criar tipo");
      return;
    }
  
    setEventTypes((prev) => [...prev, data]);
    setTipo(data.value);
  
    showToast("Tipo criado com sucesso!");
  };
  

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


  const handleSubmit = async () => {
    const isValid = validate();
    if (!isValid) return;

    setIsSubmiting(true);

    if (editingEvent) {
      const { data: reponseData, error } = await supabase
        .from("events")
        .update({
          nome,
          tipo,
          data,
          local
        })
        .eq("id", editingEvent.id)
        .select()
        .single();

      if (error) {
        console.error(error);
        showToast("Erro ao atualizar evento");
        setIsSubmiting(false);
        return
      }
      onUpdateEvent(reponseData);
      showToast("Evento Atualizado com sucesso")
    } else {
      const { data: reponseData, error } = await supabase
        .from("events")
        .insert([
          {
            nome,
            tipo,
            data,
            local
          }
        ])
        .select()
        .single()

      if (error) {
        console.error(error);
        showToast("Erro ao criar evento!");
        setIsSubmiting(false)
        return
      }

      onAddEvent(reponseData);
      showToast("Evento criado com sucesso!")
    }
    setIsSubmiting(false);
    onClose();
  };
  const [eventTypes, setEventTypes] = useState([
    { label: "Operação Estúdio", value: "operacao-estudio" },
    { label: "Externa", value: "externa" },
  ])
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [isCreatingType, setIsCreatingType] = useState(false)
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

  useEffect(() => {
    if (editingEvent) {
      setNome(editingEvent.nome);
      setTipo(editingEvent.tipo);
      setData(editingEvent.data);
      setLocal(editingEvent.local)
    } else {
      setNome("");
      setTipo("");
      setData("");
      setLocal("")
    }
  }, [editingEvent])

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
        <h2 className="text-xl font-semibold m-4 text-gray-900">
          {editingEvent ? "Editar Evento" : "Novo Evento"}
        </h2>
        <div className="flex flex-col gap-4">
          <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
            <Input
              type="text"
              value={nome}
              error={!!errors.nome}
              onChange={(e) => {
                setNome(e.target.value);

                if (errors.nome) {
                  setErrors((prev) => ({ ...prev, nome: "" }));
                }
              }}
            />
          </FormField>
          <FormField label="Tipo" htmlFor="tipo" required error={errors.tipo}>
            <Select
              value={tipo}
              options={eventTypes}
              error={!!errors.tipo}
              onChange={(value) => {
                if (value === "__new__") {
                  setIsCreatingType(true);
                  return
                }
                setTipo(value);

                if (errors.tipo) {
                  setErrors((prev) => ({ ...prev, tipo: "" }))
                }
              }} />
          </FormField>
          <FormField label="Data" htmlFor="data" required error={errors.data}>
            <InputDate value={data} onChange={setData} />
          </FormField>
          <FormField label="Local" htmlFor="local" required error={errors.local}>
            <Input
              type="text"
              value={local}
              error={!!errors.local}
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
          <Button
            onClick={handleSubmit}
            type="submit"
            disabled={!isFormValid}>
            {isSubmiting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
      {isCreatingType && (
        <CreateTypeModal onClose={() => setIsCreatingType(false)}
          onCreate={handleCreateType} />
      )
      }
    </div>
  );
}
