"use client";

import { useMemo } from "react";

import type { Event } from "@/types/type-event";

import CalendarRow from "@/components/calendar/calendar-row";
import CalendarEventChip from "@/components/calendar/calendar-event-chip";
import {
  assignViagemLanes,
  filterViagensInMonth,
  getLaneCount,
  TRAVEL_LANE_HEIGHT,
  type ViagemInterval,
} from "@/components/calendar/viagem-lane-utils";

const STUDIO_KEYS = ["estudio-1", "estudio-2", "estudio-3", "estudio-4"];

const getEventStudio = (event: Event) => {
  const local = event.local?.toLowerCase()?.trim();
  if (local && STUDIO_KEYS.includes(local)) return local;
  return "viagens";
};

type Props = {
  days: Date[];
  dayWidth: number;
  viagens: ViagemInterval[];
  events: Event[];
  mode: "admin" | "colaborador";
  onEventClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
};

const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

type TravelSegmentProps = {
  viagem: ViagemInterval;
  dateKey: string;
  cidade: string;
  eventos: Event[];
  mode: "admin" | "colaborador";
  onEventClick?: (event: Event) => void;
  getChannelBadgeClass: (sigla?: string) => string;
};

function TravelSegment({
  viagem,
  dateKey,
  cidade,
  eventos,
  mode,
  onEventClick,
  getChannelBadgeClass,
}: TravelSegmentProps) {
  const isStart = dateKey === viagem.data_saida;
  const isEnd = dateKey === viagem.data_retorno;
  const isMiddle = !isStart && !isEnd;

  return (
    <div
      className={`
        flex h-full min-h-0 flex-col overflow-hidden border-purple-400 bg-purple-500/10
        ${isStart ? "rounded-l-xl border-y border-l" : ""}
        ${isEnd ? "rounded-r-xl border-y border-r" : ""}
        ${isMiddle ? "border-y" : ""}
      `}
      style={{ minHeight: `${TRAVEL_LANE_HEIGHT - 8}px` }}
    >
      {isStart && (
        <div className="shrink-0 border-b border-purple-300/60 px-2 py-1.5 dark:border-purple-800">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-[11px] font-semibold text-purple-800 dark:text-purple-200">
              🚐 {viagem.nome}
            </p>
            <span className="shrink-0 rounded-full bg-purple-600 px-1.5 py-[1px] text-[8px] font-bold text-white">
              Saída
            </span>
          </div>
          <p className="truncate text-[9px] text-purple-600 dark:text-purple-400">
            {cidade}
          </p>
        </div>
      )}

      {isEnd && (
        <div className="shrink-0 border-b border-purple-300/60 px-2 py-1.5 dark:border-purple-800">
          <div className="flex items-center justify-between gap-1">
            <p className="truncate text-[11px] font-semibold text-purple-800 dark:text-purple-200">
              🚐 {viagem.nome}
            </p>
            <span className="shrink-0 rounded-full bg-purple-600 px-1.5 py-[1px] text-[8px] font-bold text-white">
              Retorno
            </span>
          </div>
          <p className="truncate text-[9px] text-purple-600 dark:text-purple-400">
            {cidade}
          </p>
        </div>
      )}

      {isMiddle && (
        <div className="flex shrink-0 items-center gap-1 border-b border-purple-300/40 px-2 py-1 dark:border-purple-800/60">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500"
            aria-hidden
          />
          <p className="truncate text-[9px] font-medium text-purple-700/90 dark:text-purple-300/90">
            {viagem.nome}
          </p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden px-2 py-1.5">
        {eventos.length === 0 && isMiddle && (
          <p className="text-[9px] italic text-purple-600/70 dark:text-purple-400/70">
            Em viagem
          </p>
        )}
        {eventos.map((event) => (
          <CalendarEventChip
            key={event.id}
            event={event}
            mode={mode}
            variant="travel"
            onClick={onEventClick}
            getChannelBadgeClass={getChannelBadgeClass}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyLaneSlot() {
  return (
    <div
      className="rounded-lg border border-dashed border-transparent"
      style={{ height: `${TRAVEL_LANE_HEIGHT - 8}px` }}
      aria-hidden
    />
  );
}

export default function ViagensCalendarRow({
  days,
  dayWidth,
  viagens,
  events,
  mode,
  onEventClick,
  getChannelBadgeClass,
}: Props) {
  const monthStart = formatDateKey(days[0]);
  const monthEnd = formatDateKey(days[days.length - 1]);

  const { monthViagens, laneMap, laneCount } = useMemo(() => {
    const filtered = filterViagensInMonth(viagens, monthStart, monthEnd);
    const map = assignViagemLanes(filtered);
    return {
      monthViagens: filtered,
      laneMap: map,
      laneCount: getLaneCount(map),
    };
  }, [viagens, monthStart, monthEnd]);

  const rowMinHeight =
    laneCount > 0
      ? laneCount * TRAVEL_LANE_HEIGHT + 24
      : 160;

  const getCidade = (viagem: ViagemInterval, dateKey: string) => {
    const eventosDoDia = events.filter(
      (e) => e.viagem_id === viagem.id && e.data === dateKey,
    );
    return (
      eventosDoDia[0]?.local ||
      viagem.nome.split("-").pop()?.trim() ||
      "Em deslocamento"
    );
  };

  if (laneCount === 0) {
    return (
      <CalendarRow
        title="Viagens"
        days={days}
        dayWidth={dayWidth}
        rowMinHeight={120}
      >
        {(dateKey) => {
          const externalEvents = events.filter(
            (event) =>
              getEventStudio(event) === "viagens" &&
              event.data === dateKey &&
              !event.viagem_id,
          );

          if (externalEvents.length === 0) return null;

          return (
            <div className="flex flex-col gap-2">
              {externalEvents.map((event) => (
                <CalendarEventChip
                  key={event.id}
                  event={event}
                  mode={mode}
                  onClick={onEventClick}
                  getChannelBadgeClass={getChannelBadgeClass}
                />
              ))}
            </div>
          );
        }}
      </CalendarRow>
    );
  }

  return (
    <CalendarRow
      title="Viagens"
      days={days}
      dayWidth={dayWidth}
      rowMinHeight={rowMinHeight}
    >
      {(dateKey) => {
        const externalEvents = events.filter(
          (event) =>
            getEventStudio(event) === "viagens" &&
            event.data === dateKey &&
            !event.viagem_id,
        );

        return (
          <div className="flex flex-col gap-2">
            {Array.from({ length: laneCount }).map((_, laneIndex) => {
              const viagem = monthViagens.find(
                (v) =>
                  laneMap.get(v.id) === laneIndex &&
                  dateKey >= v.data_saida &&
                  dateKey <= v.data_retorno,
              );

              if (!viagem) {
                return <EmptyLaneSlot key={`lane-${laneIndex}`} />;
              }

              const eventosDoDia = events.filter(
                (e) => e.viagem_id === viagem.id && e.data === dateKey,
              );

              return (
                <TravelSegment
                  key={`${viagem.id}-${laneIndex}`}
                  viagem={viagem}
                  dateKey={dateKey}
                  cidade={getCidade(viagem, dateKey)}
                  eventos={eventosDoDia}
                  mode={mode}
                  onEventClick={onEventClick}
                  getChannelBadgeClass={getChannelBadgeClass}
                />
              );
            })}

            {externalEvents.map((event) => (
              <CalendarEventChip
                key={event.id}
                event={event}
                mode={mode}
                onClick={onEventClick}
                getChannelBadgeClass={getChannelBadgeClass}
              />
            ))}
          </div>
        );
      }}
    </CalendarRow>
  );
}
