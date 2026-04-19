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

  const [isSubmiting, setIsSubmiting] = useState(false);

  const [errors, setErrors] = useState({
    nome: "",
    tipo: "",
    data: "",
    local: "",
  });

  const fetchTypes = async () => {
    const { data, error } = await supabase
      .from("event_types")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((t: any) => ({
      label: t.name,
      value: t.name,
    }));

    setEventTypes(formatted);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    if (editingEvent) {
      setNome(editingEvent.nome);
      setTipo(editingEvent.tipo);
      setData(editingEvent.data);
      setLocal(editingEvent.local);
    } else {
      setNome("");
      setTipo("");
      setData("");
      setLocal("");
    }
  }, [editingEvent]);

  const handleCreateType = async (name: string) => {
    const { data, error } = await supabase
      .from("event_types")
      .insert([{ name }])
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("Erro ao criar tipo");
      return;
    }

    const newType = {
      label: data.name,
      value: data.name,
    };

    setEventTypes((prev) => [...prev, newType]);
    setTipo(newType.value);

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
    if (!validate()) return;

    setIsSubmiting(true);

    try {
      if (editingEvent) {
        const { data: responseData, error } = await supabase
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

        if (error) throw error;

        onUpdateEvent(responseData);
        showToast("Evento atualizado com sucesso!");
      } else {
        const { data: responseData, error } = await supabase
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
          .single();

        if (error) throw error;

        onAddEvent(responseData);
        showToast("Evento criado com sucesso!");
      }

      onClose();

    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar evento");
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
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          {editingEvent ? "Editar Evento" : "Novo Evento"}
        </h2>

        <div className="flex flex-col gap-4">

          <FormField label="Nome" required error={errors.nome}>
            <Input
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

          <FormField label="Tipo" required error={errors.tipo}>
            <Select
              value={tipo}
              options={eventTypes}
              allowCreate
              onChange={(value) => {
                if (value === "__new__") {
                  setIsCreatingType(true);
                } else {
                  setTipo(value);
                }
              }}
            />
          </FormField>

          <FormField label="Data" required error={errors.data}>
            <InputDate value={data} onChange={setData} />
          </FormField>

          <FormField label="Local" required error={errors.local}>
            <Input
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

        <div className="mt-6 flex justify-end gap-2">
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {isSubmiting ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {isCreatingType && (
        <CreateOptionModal
          title="Novo tipo de evento"
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
