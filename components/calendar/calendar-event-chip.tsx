"use client";

import type { Event } from "@/types/type-event";

type Props = {
  event: Event;
  mode: "admin" | "colaborador";
  onClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
  variant?: "default" | "travel";
};

const STUDIO_LABELS: Record<string, string> = {
  "estudio-1": "Estúdio 1",
  "estudio-2": "Estúdio 2",
  "estudio-3": "Estúdio 3",
  "estudio-4": "Estúdio 4",
};

const formatLocal = (local?: string) => {
  if (!local) return null;
  return STUDIO_LABELS[local] ?? local;
};

export default function CalendarEventChip({
  event,
  mode,
  onClick,
  getChannelBadgeClass,
  variant = "default",
}: Props) {
  const isScaled = !!event.isUserScaled;
  const isTravel = !!event.viagem_id;

  const isTravelVariant = variant === "travel";

  const containerClass = isTravelVariant
    ? `
        w-full overflow-hidden rounded-lg border px-2 py-1 text-left transition
        ${
          isScaled && mode === "colaborador"
            ? "border-blue-400 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-950/80"
            : "border-purple-300 bg-white/90 hover:bg-white dark:border-purple-800 dark:bg-gray-950/80"
        }
      `
    : `
        w-full rounded-xl border px-3 py-2 text-left transition
        ${
          isScaled && mode === "colaborador"
            ? "border-blue-400 bg-blue-50 hover:bg-blue-100 dark:border-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
            : "border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        }
      `;

  return (
    <button type="button" onClick={() => onClick?.(event)} className={containerClass}>
      <div className="flex flex-col gap-1">
        {mode === "colaborador" && isScaled && (
          <span className="text-[9px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Sua escala · ver detalhes
          </span>
        )}

        <div className="flex items-center gap-1 overflow-hidden">
          {event.channel?.sigla && (
            <span
              className={`
                shrink-0 rounded px-1 py-[1px] text-[9px] font-semibold
                sm:text-[10px]
                ${getChannelBadgeClass(event.channel.sigla)}
              `}
            >
              {event.channel.sigla}
            </span>
          )}

          <span
            className={`truncate font-semibold text-gray-900 dark:text-white ${
              isTravelVariant ? "text-[11px]" : "text-xs"
            }`}
          >
            {event.nome}
          </span>
        </div>

        {mode === "admin" && event.hora_inicio && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{event.hora_inicio}</p>
        )}

        {mode === "colaborador" && !isTravel && formatLocal(event.local) && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400">
            📍 {formatLocal(event.local)}
          </p>
        )}

        {mode === "admin" && !isTravelVariant && event.local && (
          <p className="text-[11px] text-gray-500 dark:text-gray-400">{event.local}</p>
        )}
      </div>
    </button>
  );
}
