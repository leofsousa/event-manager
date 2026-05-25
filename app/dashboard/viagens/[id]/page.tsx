"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Event } from "@/types/type-event";
import ViagemEscalaSection from "@/components/viagens/viagem-escala-section";

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
  observacoes?: string;
};

export default function ViagemDetalhePage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [viagem, setViagem] = useState<Viagem | null>(null);
  const [eventos, setEventos] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [colaboradoresEscalados, setColaboradoresEscalados] = useState<string[]>(
    [],
  );
  const [isSavingScale, setIsSavingScale] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: string) =>
    format(new Date(date + "T00:00:00"), "dd 'de' MMMM", { locale: ptBR });

  const fetchViagem = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("viagens")
        .select("*")
        .eq("id", id)
        .single();

      if (err) throw err;
      setViagem(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao carregar viagem";
      setError(errorMessage);
      console.error(errorMessage, err);
    }
  }, [id]);

  const fetchEventos = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .select("*, channels(sigla), creator:profiles!events_created_by_fkey(username, email)")
        .eq("viagem_id", id)
        .order("data", { ascending: true });

      if (err) throw err;
      setEventos(data || []);
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchAllEvents = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from("events")
        .select("*, channels(sigla), creator:profiles!events_created_by_fkey(username, email)")
        .is("viagem_id", null)
        .order("data", { ascending: true });

      if (err) throw err;
      setAllEvents(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadColaboradoresEscalados = useCallback(async (eventosViagem: Event[]) => {
    if (eventosViagem.length === 0) {
      setColaboradoresEscalados([]);
      return;
    }

    try {
      const { data, error: err } = await supabase
        .from("event_shifts")
        .select("event_shift_collaborators(collaborator_id)")
        .eq("event_id", eventosViagem[0].id);

      if (err) throw err;

      const ids = [
        ...new Set(
          (data ?? []).flatMap(
            (shift) =>
              (
                shift.event_shift_collaborators as {
                  collaborator_id: string;
                }[]
              )?.map((c) => c.collaborator_id) ?? [],
          ),
        ),
      ];

      setColaboradoresEscalados(ids);
    } catch (err) {
      console.error(err);
      setColaboradoresEscalados([]);
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        await fetchViagem();
        await fetchEventos();
        await fetchAllEvents();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Erro ao carregar dados";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, fetchViagem, fetchEventos, fetchAllEvents]);

  useEffect(() => {
    loadColaboradoresEscalados(eventos);
  }, [eventos, loadColaboradoresEscalados]);

  const handleVincularEvento = async (eventId: string) => {
    const evento = allEvents.find((e) => e.id === eventId);

    if (!evento || !viagem) {
      showToast("Evento ou viagem inválida");
      return;
    }

    if (
      evento.data < viagem.data_saida ||
      evento.data > viagem.data_retorno
    ) {
      showToast("A data do evento está fora do período da viagem");
      return;
    }

    const { error } = await supabase
      .from("events")
      .update({ viagem_id: id })
      .eq("id", eventId);

    if (error) {
      showToast("Erro ao vincular evento");
      return;
    }

    if (colaboradoresEscalados.length > 0) {
      try {
        await aplicarEscalaNoEvento(eventId, colaboradoresEscalados);
      } catch (err) {
        console.error(err);
      }
    }

    await fetchEventos();
    await fetchAllEvents();
    showToast("Evento vinculado!");
  };

  const handleDesvincularEvento = async (eventId: string) => {
    const { error } = await supabase
      .from("events")
      .update({ viagem_id: null })
      .eq("id", eventId);

    if (error) {
      showToast("Erro ao desvincular evento");
      return;
    }

    await fetchEventos();
    await fetchAllEvents();
    showToast("Evento desvinculado!");
  };

  const aplicarEscalaNoEvento = async (
    eventoId: string,
    colaboradorIds: string[],
  ) => {
    const { data: oldShifts } = await supabase
      .from("event_shifts")
      .select("id")
      .eq("event_id", eventoId);

    if (oldShifts && oldShifts.length > 0) {
      const oldIds = oldShifts.map((s) => s.id);
      await supabase
        .from("event_shift_collaborators")
        .delete()
        .in("shift_id", oldIds);
      await supabase.from("event_shifts").delete().eq("event_id", eventoId);
    }

    if (colaboradorIds.length === 0) return;

    const { data: newShift, error: shiftError } = await supabase
      .from("event_shifts")
      .insert([
        {
          event_id: eventoId,
          start_time: null,
          end_time: null,
        },
      ])
      .select()
      .single();

    if (shiftError) throw shiftError;

    const { error: collabError } = await supabase
      .from("event_shift_collaborators")
      .insert(
        colaboradorIds.map((collaboratorId) => ({
          shift_id: newShift.id,
          collaborator_id: collaboratorId,
        })),
      );

    if (collabError) throw collabError;
  };

  const handleSaveScale = async () => {
    if (eventos.length === 0) {
      showToast("Vincule ou crie pelo menos um evento antes de salvar a escala");
      return;
    }

    setIsSavingScale(true);

    try {
      for (const evento of eventos) {
        await aplicarEscalaNoEvento(evento.id, colaboradoresEscalados);
      }

      showToast("Escala salva em todos os eventos da viagem!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar escala");
    }

    setIsSavingScale(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <p className="text-sm text-gray-500">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 overflow-y-auto p-6">
        <p className="text-red-500">Erro: {error}</p>
      </div>
    );
  }

  if (!viagem) {
    return (
      <div className="flex min-h-0 flex-1 overflow-y-auto p-6">
        <p>Viagem não encontrada</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 p-6 pb-12">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              {viagem.nome}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              🚐 {formatDate(viagem.data_saida)} →{" "}
              {formatDate(viagem.data_retorno)}
            </p>
            {viagem.observacoes && (
              <p className="mt-1 text-sm text-gray-400">{viagem.observacoes}</p>
            )}
          </div>
          <Button variant="secondary" onClick={() => router.back()}>
            Voltar
          </Button>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Eventos da viagem
            </h2>
            <Button
              variant="secondary"
              onClick={() =>
                router.push(`/dashboard/eventos/novo?viagemId=${viagem.id}`)
              }
            >
              + Criar novo evento
            </Button>
          </div>

          {eventos.length === 0 ? (
            <p className="text-sm text-gray-400">
              Nenhum evento vinculado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {eventos.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {evento.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {evento.data} · 📍 {evento.local}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        router.push(`/dashboard/eventos/${evento.id}`)
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDesvincularEvento(evento.id)}
                    >
                      Desvincular
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {allEvents.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
              Vincular evento existente
            </h2>
            <div className="flex max-h-64 flex-col gap-2 overflow-y-auto pr-1">
              {allEvents.map((evento) => (
                <div
                  key={evento.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-900"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {evento.nome}
                    </p>
                    <p className="text-xs text-gray-500">
                      📅 {evento.data} · 📍 {evento.local}
                    </p>
                  </div>
                  <Button onClick={() => handleVincularEvento(evento.id)}>
                    Vincular
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Escala da viagem
          </h2>
          <p className="mt-1 mb-4 text-sm text-gray-500 dark:text-gray-400">
            Selecione os colaboradores escalados na viagem.
          </p>

          <ViagemEscalaSection
            selected={colaboradoresEscalados}
            onChange={setColaboradoresEscalados}
          />

          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveScale}
              disabled={isSavingScale || eventos.length === 0}
            >
              {isSavingScale ? "Salvando..." : "Salvar escala"}
            </Button>
          </div>

          {eventos.length === 0 && (
            <p className="mt-2 text-right text-xs text-amber-600 dark:text-amber-400">
              Vincule ou crie pelo menos um evento para salvar.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
