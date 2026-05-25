"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Input from "@/components/ui/input";
import InputDate from "@/components/ui/input-date";
import Button from "@/components/ui/button";
import FormField from "@/components/events/form-field";
import Select from "@/components/ui/select";
import CreateOptionModal from "@/components/modals/create-option-modal";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

const SPECIAL_NAME_ONLY_TYPES: Record<string, string> = {
  "bora-leilao": "Bora Leilão",
  "dia-empresa": "Dia Empresa",
};

export default function EditEventoPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);

  const [isCreatingType, setIsCreatingType] = useState(false);

  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [channel, setChannel] = useState("");
  const [data, setData] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFim, setHoraFim] = useState("");
  const [local, setLocal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [viagemId, setViagemId] = useState<string | null>(null);

  const [customLocal, setCustomLocal] = useState("");
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [errors, setErrors] = useState({
    nome: "",
    tipo: "",
    data: "",
    local: "",
  });

  const isStudio = tipo === "operacao-estudio";
  const isNameOnlyType = tipo in SPECIAL_NAME_ONLY_TYPES;

  const studioOptions = [
    { label: "Estúdio 1", value: "estudio-1" },
    { label: "Estúdio 2", value: "estudio-2" },
    { label: "Estúdio 3", value: "estudio-3" },
    { label: "Estúdio 4", value: "estudio-4" },
    { label: "Outro", value: "__other__" },
  ];

  const fetchEvent = async () => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (err) {
        throw err;
      }

      setNome(data.nome);
      setTipo(data.tipo);
      setData(data.data);
      setHoraInicio(data.hora_inicio || "");
      setHoraFim(data.hora_fim || "");
      setObservacoes(data.observacoes || "");
      setChannel(data.channel_id || "");
      setViagemId(data.viagem_id || null);

      // local
      if (data.tipo === "operacao-estudio") {
        const isStudioOption = studioOptions.some(
          (opt) => opt.value === data.local,
        );

        if (isStudioOption) {
          setLocal(data.local);
          setIsOtherSelected(false);
          setCustomLocal("");
        } else {
          setLocal("");
          setCustomLocal(data.local);
          setIsOtherSelected(true);
        }
      } else {
        setLocal(data.local);
      }

      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar evento";
      setError(errorMessage);
      console.error(errorMessage, err);
      showToast("Erro ao carregar evento");
    } finally {
      setLoading(false);
    }
  };

  const fetchTypes = async () => {
    try {
      const { data, error: err } = await supabase
        .from("event_types")
        .select("*");

      if (err) {
        throw err;
      }

      setEventTypes(
        (data || []).map((t: any) => ({
          label: String(t.label).trim(),
          value: String(t.value).trim(),
        })),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar tipos";
      console.error(errorMessage, err);
    }
  };

  const fetchChannels = async () => {
    try {
      const { data, error: err } = await supabase.from("channels").select("*");

      if (err) {
        throw err;
      }

      setChannels(
        (data || []).map((c: any) => ({
          label: `${c.sigla} - ${c.name}`,
          value: c.id,
        })),
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar canais";
      console.error(errorMessage, err);
    }
  };

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchEvent(), fetchTypes(), fetchChannels()]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar dados";
        setError(errorMessage);
        console.error(errorMessage, err);
      }
    };

    loadData();
  }, [id]);

  useEffect(() => {
    const fixedName = SPECIAL_NAME_ONLY_TYPES[tipo];

    if (fixedName) {
      setNome(fixedName);
      setLocal(fixedName);
      setChannel("");
    } else if (!isStudio) {
      setIsOtherSelected(false);
      setCustomLocal("");
    }
  }, [tipo, isStudio]);

  const handleCreateType = async (name: string) => {
    const formatted = name.toLowerCase().replace(/\s+/g, "-");

    const { data, error } = await supabase
      .from("event_types")
      .insert([{ label: name, value: formatted }])
      .select()
      .single();

    if (error) {
      showToast("Erro ao criar tipo");
      return;
    }

    setEventTypes((prev) => [...prev, data]);
    setTipo(data.value);

    showToast("Tipo criado!");
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .update({
          nome,
          tipo,
          local: isNameOnlyType ? SPECIAL_NAME_ONLY_TYPES[tipo] : local,
          data,
          hora_inicio: horaInicio || null,
          hora_fim: horaFim || null,
          observacoes,
          channel_id: isNameOnlyType ? null : channel || null,
          viagem_id: viagemId || null,
        })
        .eq("id", id);

      if (error) throw error;

      showToast("Evento atualizado!");
      router.push("/dashboard/eventos");
    } catch (err) {
      console.error(err);
      showToast("Erro ao atualizar");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Editar Evento</h1>

      <div className="flex flex-col gap-4">
        <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
          <Input
            id="nome"
            value={nome}
            disabled={isNameOnlyType}
            onChange={(e) => setNome(e.target.value)}
          />
        </FormField>

        <FormField label="Tipo" htmlFor="tipo" required error={errors.tipo}>
          <Select
            id="tipo"
            value={tipo}
            options={eventTypes}
            disabled={eventTypes.length === 0}
            placeholder={
              eventTypes.length === 0
                ? "Carregando tipos..."
                : "Selecione uma opção"
            }
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

        {!isNameOnlyType && (
          <>
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
                <Input
                  id="local"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                />
              )}
            </FormField>

            <FormField label="Canal">
              <Select
                value={channel}
                options={channels}
                onChange={(value) => setChannel(value)}
              />
            </FormField>
          </>
        )}

        <FormField label="Data" required>
          <InputDate value={data} onChange={setData} />
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Hora de início">
            <Input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
            />
          </FormField>

          <FormField label="Hora final">
            <Input
              type="time"
              value={horaFim}
              onChange={(e) => setHoraFim(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Observações">
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border
            bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700
            dark:text-gray-100 focus:outline-none focus:ring-2
            focus:ring-blue-500 border-gray-300 resize-none"
          />
        </FormField>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit}>Salvar alterações</Button>
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
