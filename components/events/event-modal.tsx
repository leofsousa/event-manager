"use client";

import type { Event } from "@/types/type-event";
import { useState, useEffect, useMemo } from "react";
import Input from "@/components/ui/input";
import InputDate from "@/components/ui/input-date";
import Button from "@/components/ui/button";
import FormField from "@/components/events/form-field";
import Select from "@/components/ui/select";
import CreateOptionModal from "@/components/modals/create-option-modal";
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
  const [channels, setChannels] = useState<{ label: string; value: string }[]>([]);

  const [isCreatingType, setIsCreatingType] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [channel, setChannel] = useState("");
  const [data, setData] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [dataSaida, setDataSaida] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");

  const [customLocal, setCustomLocal] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [isSubmiting, setIsSubmiting] = useState(false);

  const [errors, setErrors] = useState({
    nome: "",
    tipo: "",
    data: "",
    local: "",
  });

  const studioOptions = useMemo(() => [
    { label: "Estúdio 1", value: "estudio-1" },
    { label: "Estúdio 2", value: "estudio-2" },
    { label: "Estúdio 3", value: "estudio-3" },
    { label: "Estúdio 4", value: "estudio-4" },
    { label: "Outro", value: "__other__" },
  ], []);

  const isStudio = tipo === "operacao-estudio";
  const isExterna = tipo === "externa";

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

  const fetchChannels = async () => {
    const { data, error } = await supabase
      .from("channels")
      .select("*");

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((c: any) => ({
      label: `${c.sigla} - ${c.name}`,
      value: c.id,
    }));

    setChannels(formatted);
  };

  useEffect(() => {
    fetchTypes();
    fetchChannels();
  }, []);

  useEffect(() => {
    if (editingEvent) {
      setNome(editingEvent.nome);
      setTipo(editingEvent.tipo);
      setData(editingEvent.data);
      setObservacoes(editingEvent.observacoes || "");

      setChannel((editingEvent as any)?.channel_id || "");

      setDataSaida((editingEvent as any)?.data_saida || "");
      setDataRetorno((editingEvent as any)?.data_retorno || "");

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
      setChannel("");

      setDataSaida("");
      setDataRetorno("");
    }
  }, [editingEvent, studioOptions]);

  const handleCreateType = async (name: string) => {
    const formatted = name.toLowerCase().replace(/\s+/g, '-');

    const { data: responseData, error } = await supabase
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
      label: responseData.label,
      value: responseData.value,
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
            local,
            data,
            observacoes,
            channel_id: channel || null,

            data_saida: dataSaida || null,
            data_retorno: dataRetorno || null,
          })
          .eq("id", editingEvent.id)
          .select("*, channels(sigla)")
          .single();

        if (error) throw error;

        onUpdateEvent(responseData);
        showToast("Evento atualizado!");

      } else {
        const { data: responseData, error } = await supabase
          .from("events")
          .insert([{
            nome,
            tipo,
            local,
            data,
            observacoes,
            channel_id: channel || null,

            data_saida: dataSaida || null,
            data_retorno: dataRetorno || null,
          }])
          .select("*, channels(sigla)")
          .single();

        if (error) throw error;

        onAddEvent(responseData);
        showToast("Evento criado!");
      }

      onClose();

    } catch (err: any) {
      console.error("ERRO REAL:", err);
      showToast(err.message || "Erro ao salvar");
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

          <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
            <Input id="nome" value={nome} onChange={(e) => setNome(e.target.value)} />
          </FormField>

          <FormField label="Tipo" htmlFor="tipo" required error={errors.tipo}>
            <Select
              id="tipo"
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

          <FormField label="Canal" htmlFor="canal" required={false}>
            <Select
              id="canal"
              value={channel}
              options={channels}
              onChange={(value) => setChannel(value)}
            />
          </FormField>

          <FormField label="Local" htmlFor="local" required error={errors.local}>
            {isStudio ? (
              <>
                <Select
                  id="local"
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
                    id="local"
                    value={customLocal}
                    onChange={(e) => {
                      setCustomLocal(e.target.value);
                      setLocal(e.target.value);
                    }}
                  />
                )}
              </>
            ) : (
              <Input id="local" value={local} onChange={(e) => setLocal(e.target.value)} />
            )}
          </FormField>

          <FormField label="Data" htmlFor="data" required error={errors.data}>
            <InputDate id="data" value={data} onChange={setData} />
          </FormField>

          {/* 🚐 VIAGEM */}
          {isExterna && (
            <>
              <FormField label="Data de saída" htmlFor="data-saida" required={false}>
                <InputDate id="data-saida" value={dataSaida} onChange={setDataSaida} />
              </FormField>

              <FormField label="Data de retorno" htmlFor="data-retorno" required={false}>
                <InputDate id="data-retorno" value={dataRetorno} onChange={setDataRetorno} />
              </FormField>
            </>
          )}

          <FormField label="Observações" htmlFor="observacoes" required={false}>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border resize-none"
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
