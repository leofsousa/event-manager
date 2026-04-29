'use client';

import type { Event } from "@/types/type-event";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

type Props = {
  event: Event;
  onDelete: (event: Event) => void;
  mode?: 'admin' | 'colaborador';
};

export default function EventCard({ event, onDelete, mode = 'admin' }: Props) {
  const router = useRouter();
  const isFromViagem = !!event.viagem_id;

  const channelStyles: Record<string, string> = {
    CR: "bg-[#a9e22c] text-white",
    CC: "bg-[#d79230] text-white",
    TV: "bg-[#904712] text-white",
    "A+": "bg-[#335a45] text-white",
    RW: "bg-[#006e96] text-white",
    "RW+": "bg-[#37b4d8] text-white",
    CB: "bg-white text-black",
  };

  const channelSigla = event.channel?.sigla;

  // ✅ NOVA REGRA
  const isTravelEvent = !!event.viagem_id;

  // 👉 considera escala se:
  // - tem escala própria
  // - OU pertence a uma viagem
  const hasScale = event.hasScale || isTravelEvent;

  return (
    <div className={`
      bg-white dark:bg-gray-800
      border-2 rounded-xl p-4 shadow-sm hover:shadow-md
      transition flex flex-col justify-between
      ${event.isUserScaled
        ? 'border-blue-500 dark:border-blue-400'
        : 'border-gray-200 dark:border-gray-700'
      }
    `}>

      {/* BADGE ESCALADO */}
      {event.isUserScaled && event.userShift && (
        <div className="flex flex-col gap-1 mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-md w-fit">
            ✅ Você está escalado
          </span>

          {/* 🔥 só mostra horário se NÃO for viagem */}
          {!isTravelEvent && (
            <span className="text-xs text-gray-500 dark:text-gray-400 px-1">
              🕐 Turno: {event.userShift.start_time} - {event.userShift.end_time}
            </span>
          )}

          {event.isFirstShift && event.arrivalTime && (
            <span className="text-xs text-blue-500 dark:text-blue-400 px-1">
              📍 Chegada: {event.arrivalTime}
            </span>
          )}
        </div>
      )}

      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event.nome}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300">
            {event.tipo}
          </p>
        </div>

        {channelSigla && (
          <span className={`
            text-[11px] px-2 py-1 rounded-md font-semibold whitespace-nowrap
            ${channelStyles[channelSigla] || "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100"}
          `}>
            {channelSigla}
          </span>
        )}
      </div>

      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1 mb-4">
        <p>📅 {event.data}</p>
        <p>📍 {event.local}</p>

        {/* 🔥 NÃO mostra horário em viagem */}
        {!isTravelEvent && event.userShift?.start_time && (
          <p>⏰ Início: {event.userShift.start_time}</p>
        )}

        {!isTravelEvent && event.userShift?.start_time && event.userShift?.end_time && (() => {
          const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
          };

          const start = toMinutes(event.userShift!.start_time);
          let end = toMinutes(event.userShift!.end_time);
          if (end <= start) end += 1440;

          const total = end - start;
          const hours = Math.floor(total / 60);
          const minutes = total % 60;

          const duration = hours > 0 && minutes > 0
            ? `${hours}h ${minutes}min`
            : hours > 0
              ? `${hours}h`
              : `${minutes}min`;

          return <p>⏱ Duração: {duration}</p>;
        })()}
      </div>

      {/* 🔥 BADGE ESCALA */}
      <div className="mb-4">
        {hasScale ? (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
            {isTravelEvent ? 'Escala da viagem' : 'Com escala'}
          </span>
        ) : (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-md">
            Sem escala
          </span>
        )}
      </div>

      {mode === 'admin' && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            disabled={isFromViagem}
            className={
              isFromViagem
                ? "bg-gray-400 cursor-not-allowed"
                : event.hasScale
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-green-600 hover:bg-green-500"
            }
            onClick={() => {
              if (isFromViagem) return;
              router.push(`/dashboard/eventos/${event.id}/escala`);
            }}
          >
            {isFromViagem
              ? "Escala via viagem 🔒"
              : event.hasScale
                ? "Gerenciar escala"
                : "Criar escala"}
          </Button>


          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none"
              onClick={() => router.push(`/dashboard/eventos/${event.id}`)}
            >
              Editar
            </Button>
            <Button
              variant="danger"
              className="flex-1 sm:flex-none"
              onClick={() => onDelete(event)}
            >
              Excluir
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
