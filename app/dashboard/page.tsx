"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import { mapEventsWithUserScale } from "@/app/utils/map-events-with-user-scale";

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
    if (!user) return;

    setLoadingData(true);

    const [eventsResponse, viagensResponse] = await Promise.all([
      supabase.from("events").select(`
        *,
        channel:channels(sigla),
        creator:profiles!events_created_by_fkey(username, email),
        viagem:viagem_id(
          id,
          nome,
          data_saida,
          data_retorno
        ),
        event_shifts(
          id,
          start_time,
          end_time,
          event_shift_collaborators(
            collaborator_id
          )
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

    const mapped = mapEventsWithUserScale(
      (eventsResponse.data as Record<string, unknown>[]) || [],
      user.id,
    );

    setEvents(mapped);
    setViagens((viagensResponse.data as Viagem[]) || []);

    setLoadingData(false);
    setInitialized(true);
  }, [user]);

  useEffect(() => {
    if (!loading && user) {
      fetchData();
    }
  }, [loading, user, fetchData]);

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agenda Operacional
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualização mensal das operações
          </p>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-6 pt-4">
        <CalendarView events={events} viagens={viagens} mode="admin" />
      </div>
    </div>
  );
}
