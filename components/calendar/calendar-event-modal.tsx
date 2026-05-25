"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import Button from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import type { Event } from "@/types/type-event";

type ShiftDetail = {
  id: string;
  start_time: string;
  end_time: string;
  colaboradores: { id: string; username: string; cargo?: string | null }[];
};

type Props = {
  event: Event;
  mode: "admin" | "colaborador";
  onEventChange?: (event: Event) => void;
  onClose: () => void;
};

const STUDIO_LABELS: Record<string, string> = {
  "estudio-1": "Estúdio 1",
  "estudio-2": "Estúdio 2",
  "estudio-3": "Estúdio 3",
  "estudio-4": "Estúdio 4",
};

const formatLocal = (local?: string) => {
  if (!local) return "—";
  return STUDIO_LABELS[local] ?? local;
};

const formatDate = (date: string) => {
  try {
    return new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return date;
  }
};

const formatTime = (time?: string | null) => {
  if (!time) return null;
  return time.slice(0, 5);
};

const getDurationLabel = (start?: string | null, end?: string | null) => {
  if (!start || !end) return null;

  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const startMinutes = toMinutes(start);
  let endMinutes = toMinutes(end);

  if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) return null;

  if (endMinutes <= startMinutes) {
    endMinutes += 1440;
  }

  const total = endMinutes - startMinutes;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}min`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}min`;
};

export default function CalendarEventModal({
  event,
  mode,
  onEventChange,
  onClose,
}: Props) {
  const router = useRouter();
  const [shifts, setShifts] = useState<ShiftDetail[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(mode === "admin");
  const [shiftsError, setShiftsError] = useState<string | null>(null);
  const [horaFim, setHoraFim] = useState(event.hora_fim?.slice(0, 5) || "");
  const [savingHoraFim, setSavingHoraFim] = useState(false);
  const [horaFimError, setHoraFimError] = useState<string | null>(null);

  const isFromViagem = !!event.viagem_id;
  const creatorName =
    event.creator?.username || event.creator?.email || "Não registrado";
  const durationLabel = getDurationLabel(event.hora_inicio, horaFim);

  useEffect(() => {
    setHoraFim(event.hora_fim?.slice(0, 5) || "");
    setHoraFimError(null);
  }, [event.hora_fim, event.id]);

  useEffect(() => {
    if (mode !== "admin") {
      setLoadingShifts(false);
      return;
    }

    const loadShifts = async () => {
      setLoadingShifts(true);
      setShiftsError(null);

      try {
        const { data: shiftsData, error } = await supabase
          .from("event_shifts")
          .select(
            `
            id,
            start_time,
            end_time,
            event_shift_collaborators (
              collaborator_id
            )
          `,
          )
          .eq("event_id", event.id)
          .order("start_time", { ascending: true });

        if (error) throw error;

        const collaboratorIds = [
          ...new Set(
            (shiftsData ?? []).flatMap((shift) =>
              (shift.event_shift_collaborators ?? []).map(
                (c: { collaborator_id: string }) => c.collaborator_id,
              ),
            ),
          ),
        ];

        let profilesMap = new Map<
          string,
          { username: string; cargo?: string | null }
        >();

        if (collaboratorIds.length > 0) {
          const { data: profiles, error: profilesError } = await supabase
            .from("profiles")
            .select("id, username, cargo")
            .in("id", collaboratorIds);

          if (profilesError) throw profilesError;

          profilesMap = new Map(
            (profiles ?? []).map((p) => [
              p.id,
              { username: p.username, cargo: p.cargo },
            ]),
          );
        }

        const formatted: ShiftDetail[] = (shiftsData ?? []).map((shift) => ({
          id: shift.id,
          start_time: shift.start_time ?? "",
          end_time: shift.end_time ?? "",
          colaboradores: (shift.event_shift_collaborators ?? []).map(
            (c: { collaborator_id: string }) => {
              const profile = profilesMap.get(c.collaborator_id);
              return {
                id: c.collaborator_id,
                username: profile?.username ?? "Colaborador",
                cargo: profile?.cargo,
              };
            },
          ),
        }));

        setShifts(formatted);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Erro ao carregar escala";
        setShiftsError(message);
        setShifts([]);
      } finally {
        setLoadingShifts(false);
      }
    };

    loadShifts();
  }, [event.id, mode]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-start justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
              {event.nome}
            </h2>
            {event.channel?.sigla && (
              <span className="mt-1 inline-block rounded bg-gray-200 px-2 py-0.5 text-xs font-semibold dark:bg-gray-700">
                {event.channel.sigla}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="space-y-2">
            <p>📅 {formatDate(event.data)}</p>
            <p>📍 {formatLocal(event.local)}</p>
            <p>👤 Criado por: {creatorName}</p>
            {event.tipo && <p>🏷 {event.tipo}</p>}
            {event.hora_inicio && (
              <p>⏰ Início programado: {formatTime(event.hora_inicio)}</p>
            )}
            {horaFim && <p>🏁 Fim: {formatTime(horaFim)}</p>}
            {durationLabel && <p>⏱ Duração: {durationLabel}</p>}
            {isFromViagem && event.viagem?.nome && (
              <p>🚐 Viagem: {event.viagem.nome}</p>
            )}
          </div>

          {event.observacoes && (
            <div className="rounded-xl bg-gray-50 p-3 dark:bg-gray-800">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Observações
              </p>
              <p className="mt-1">{event.observacoes}</p>
            </div>
          )}

          {mode === "colaborador" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/40">
              {event.isUserScaled && event.userShift ? (
                <div className="space-y-1 text-blue-800 dark:text-blue-200">
                  <p className="font-semibold">✅ Você está escalado neste evento</p>
                  <p>
                    🕐 Turno: {event.userShift.start_time} – {event.userShift.end_time}
                  </p>
                  {event.isFirstShift && event.arrivalTime && (
                    <p>📍 Chegada sugerida: {event.arrivalTime}</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Você não está escalado neste evento.
                </p>
              )}
            </div>
          )}

          {mode === "admin" && (
            <div>
              <div className="mb-4 rounded-xl border border-gray-200 p-3 dark:border-gray-700">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Encerramento do evento
                </p>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="time"
                    value={horaFim}
                    onChange={(e) => setHoraFim(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 sm:w-40"
                  />

                  <Button
                    variant="secondary"
                    disabled={savingHoraFim}
                    onClick={async () => {
                      setSavingHoraFim(true);
                      setHoraFimError(null);

                      try {
                        const { error } = await supabase
                          .from("events")
                          .update({ hora_fim: horaFim || null })
                          .eq("id", event.id);

                        if (error) throw error;

                        onEventChange?.({
                          ...event,
                          hora_fim: horaFim || null,
                        });
                      } catch (err) {
                        const message =
                          err instanceof Error
                            ? err.message
                            : "Erro ao salvar hora final";
                        setHoraFimError(message);
                      } finally {
                        setSavingHoraFim(false);
                      }
                    }}
                  >
                    {savingHoraFim ? "Salvando..." : "Salvar fim"}
                  </Button>
                </div>

                {durationLabel && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Duração calculada: {durationLabel}
                  </p>
                )}

                {horaFimError && (
                  <p className="mt-2 text-xs text-red-500">{horaFimError}</p>
                )}
              </div>

              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Escala do evento
              </p>

              {loadingShifts && (
                <p className="text-gray-500">Carregando escala...</p>
              )}

              {shiftsError && (
                <p className="text-red-500">{shiftsError}</p>
              )}

              {!loadingShifts && !shiftsError && shifts.length === 0 && (
                <p className="rounded-xl border border-dashed border-yellow-300 bg-yellow-50 px-3 py-2 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
                  Nenhuma escala cadastrada.
                </p>
              )}

              {!loadingShifts && shifts.length > 0 && (
                <div className="space-y-3">
                  {shifts.map((shift, index) => (
                    <div
                      key={shift.id}
                      className="rounded-xl border border-gray-200 p-3 dark:border-gray-700"
                    >
                      <p className="mb-2 font-medium text-gray-900 dark:text-white">
                        Turno {index + 1}: {shift.start_time || "—"} –{" "}
                        {shift.end_time || "—"}
                      </p>
                      {shift.colaboradores.length === 0 ? (
                        <p className="text-xs text-gray-500">Sem colaboradores</p>
                      ) : (
                        <ul className="space-y-1">
                          {shift.colaboradores.map((colab) => (
                            <li
                              key={colab.id}
                              className="flex items-center justify-between gap-2 text-sm"
                            >
                              <span className="font-medium">{colab.username}</span>
                              {colab.cargo && (
                                <span className="text-xs text-gray-500">
                                  {colab.cargo}
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-200 px-5 py-4 sm:flex-row sm:justify-end dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>

          {mode === "admin" && (
            <>
              <Button
                variant="secondary"
                onClick={() => router.push(`/dashboard/eventos/${event.id}`)}
              >
                Editar evento
              </Button>
              <Button
                disabled={isFromViagem}
                onClick={() => {
                  if (isFromViagem) return;
                  router.push(`/dashboard/eventos/${event.id}/escala`);
                }}
              >
                {isFromViagem ? "Escala via viagem" : "Gerenciar escala"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
