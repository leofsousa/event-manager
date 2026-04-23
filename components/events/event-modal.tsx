"use client";

import type { Event } from "@/types/type-event";
import { useState, useEffect } from "react";
import Input from "@/components/ui/input";
import InputDate from "@/components/ui/input-date";
import Button from "@/components/ui/button";
import FormField from '@/components/events/form-field'
import Select from "@/components/ui/select";
import CreateOptionModal from '@/components/modals/create-option-modal';
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

type Props = {
  onClose: () => void;
  onAddEvent: (event: Event) => void;
  editingEvent?: Event | null;
  onUpdateEvent: (event: Event) => void;
};

export default function EventModal({
  onClose,
  onAddEvent,
  onUpdateEvent,
  editingEvent
}: Props) {

  const { showToast } = useToast();

  const [eventTypes, setEventTypes] = useState<{ label: string; value: string }[]>([]);
  const [isCreatingType, setIsCreatingType] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [customLocal, setCustomLocal] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [isSubmiting, setIsSubmiting] = useState(false);

  const [errors, setErrors] = useState({
    nome: "",
    tipo: "",
    data: "",
    local: "",
  });

  const studioOptions = [
    { label: "Estúdio 1", value: "estudio-1" },
    { label: "Estúdio 2", value: "estudio-2" },
    { label: "Estúdio 3", value: "estudio-3" },
    { label: "Estúdio 4", value: "estudio-4" },
    { label: "Outro", value: "__other__" },
  ];

  const isStudio = tipo === "operacao-estudio";

  // 🔹 Buscar tipos
  const fetchTypes = async () => {
    const { data, error } = await supabase
      .from("event_types")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((t: any) => ({
      label: t.label,
      value: t.value,
    }));

    setEventTypes(formatted);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  // 🔹 Preencher ao editar
  useEffect(() => {
    if (editingEvent) {
      setNome(editingEvent.nome);
      setTipo(editingEvent.tipo);
      setData(editingEvent.data);
      setObservacoes(editingEvent.observacoes || "");

      if (editingEvent.tipo === "operacao-estudio") {
        const isStudioOption = studioOptions.some(
          (opt) => opt.value === editingEvent.local
        );

        if (isStudioOption) {
          setLocal(editingEvent.local);
          setIsOtherSelected(false);
          setCustomLocal("");
        } else {
          setLocal("");
          setCustomLocal(editingEvent.local);
          setIsOtherSelected(true);
        }
      } else {
        setLocal(editingEvent.local);
      }

    } else {
      setNome("");
      setTipo("");
      setData("");
      setLocal("");
      setObservacoes("");
      setCustomLocal("");
      setIsOtherSelected(false);
    }
  }, [editingEvent]);

  // 🔹 Criar tipo
  const handleCreateType = async (name: string) => {
    const formatted = name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from("event_types")
      .insert([{ label: name, value: formatted }])
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("Erro ao criar tipo");
      return;
    }

    const newType = {
      label: data.label,
      value: data.value,
    };

    setEventTypes((prev) => [...prev, newType]);
    setTipo(newType.value);

    showToast("Tipo criado com sucesso!");
  };

  // 🔹 Validação
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

  // 🔹 Submit
  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmiting(true);

    try {
      if (editingEvent) {
        const { data, error } = await supabase
          .from("events")
          .update({
            nome,
            tipo,
            local,
            data,
            observacoes,
          })
          .eq("id", editingEvent.id)
          .select()
          .single();

        if (error) throw error;

        onUpdateEvent(data);
        showToast("Evento atualizado!");
      } else {
        const { data, error } = await supabase
          .from("events")
          .insert([{
            nome,
            tipo,
            local,
            data,
            observacoes,
          }])
          .select()
          .single();

        if (error) throw error;

        onAddEvent(data);
        showToast("Evento criado!");
      }

      onClose();

    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar");
    }

    setIsSubmiting(false);
  };

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
        className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">
          {editingEvent ? "Editar Evento" : "Novo Evento"}
        </h2>

        <div className="flex flex-col gap-4">

          <FormField label="Nome" required error={errors.nome}>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} />
          </FormField>

          <FormField label="Tipo" required error={errors.tipo}>
            <Select
              value={tipo}
              options={eventTypes}
              showCreateOption
              onChange={(value) => {
                if (value === "__new__") {
                  setIsCreatingType(true);
                } else {
                  setTipo(value);
                }
              }}
            />
          </FormField>

          <FormField label="Local" required error={errors.local}>
            {isStudio ? (
              <>
                <Select
                  value={isOtherSelected ? "__other__" : local}
                  options={studioOptions}
                  onChange={(value) => {
                    if (value === "__other__") {
                      setIsOtherSelected(true);
                      setLocal("");
                    } else {
                      setIsOtherSelected(false);
                      setLocal(value);
                    }
                  }}
                />
                {isOtherSelected && (
                  <Input
                    value={customLocal}
                    onChange={(e) => {
                      setCustomLocal(e.target.value);
                      setLocal(e.target.value);
                    }}
                  />
                )}
              </>
            ) : (
              <Input value={local} onChange={(e) => setLocal(e.target.value)} />
            )}
          </FormField>

          <FormField label="Data" required error={errors.data}>
            <InputDate value={data} onChange={setData} />
          </FormField>

          <FormField label="Observações">
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border"
            />
          </FormField>

        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>

          <Button onClick={handleSubmit} disabled={!isFormValid}>
            {isSubmiting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {isCreatingType && (
        <CreateOptionModal
          title="Novo tipo"
          placeholder="Ex: Convenção"
          onClose={() => setIsCreatingType(false)}
          onCreate={(value) => {
            handleCreateType(value);
            setIsCreatingType(false);
          }}
        />
      )}
    </div>
  );
}
