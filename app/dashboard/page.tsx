"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";

import CalendarView from "@/components/calendar/calendar-view";

import type { Event } from "@/types/type-event";

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();

  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [viagens, setViagens] = useState<Viagem[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const fetchData = useCallback(async () => {
    setLoadingData(true);

    const [eventsResponse, viagensResponse] = await Promise.all([
      supabase.from("events").select(`
        *,
        channel:channels(sigla),
        viagem:viagem_id(
          id,
          nome,
          data_saida,
          data_retorno
        )
      `),

      supabase.from("viagens").select("*"),
    ]);

    if (eventsResponse.error) {
      console.error(eventsResponse.error);
    }

    if (viagensResponse.error) {
      console.error(viagensResponse.error);
    }

    setEvents((eventsResponse.data as Event[]) || []);
    setViagens((viagensResponse.data as Viagem[]) || []);

    setLoadingData(false);
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
  }, [loading, user, fetchData]);

  /**
   * Loading apenas na primeira renderização
   */
  if (loading || (!initialized && loadingData)) {
    return (
      <div className="p-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Carregando agenda...
        </p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-full flex-col min-w-0">
      {/* HEADER */}
      <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agenda Operacional
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualização mensal das operações
          </p>
        </div>
      </div>

      {/* CONTEÚDO */}
      <div
        className="
          flex-1
          min-h-0
          min-w-0
          overflow-hidden
          p-6
        "
      >
        <CalendarView
          events={events}
          viagens={viagens}
          mode="admin"
        />
      </div>
    </div>
  );
}