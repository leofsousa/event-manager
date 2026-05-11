'use client';

import { useMemo, useState } from 'react';

import type { Event } from '@/types/type-event';

import CalendarTimeline from '@/components/calendar/calendar-timeline';

type Viagem = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

type Props = {
  events: Event[];
  viagens: Viagem[];
  mode?: 'admin' | 'colaborador';
};

const STUDIO_ORDER = [
  'estudio-1',
  'estudio-2',
  'estudio-3',
  'estudio-4',
  '__other__',
];

export default function CalendarView({
  events,
  viagens,
  mode = 'admin',
}: Props) {

  /**
   * Data atual
   */
  const today = new Date();

  /**
   * Estado mês selecionado
   */
  const [selectedMonth, setSelectedMonth] = useState(
    today.getMonth()
  );

  /**
   * Estado ano selecionado
   */
  const [selectedYear, setSelectedYear] = useState(
    today.getFullYear()
  );

  /**
   * Filtra apenas mês atual
   */
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.data);

      return (
        eventDate.getMonth() === selectedMonth &&
        eventDate.getFullYear() === selectedYear
      );
    });
  }, [events, selectedMonth, selectedYear]);

  /**
   * Ordenação operacional
   */
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {

      const studioA = STUDIO_ORDER.indexOf(
        a.estudio || '__other__'
      );

      const studioB = STUDIO_ORDER.indexOf(
        b.estudio || '__other__'
      );

      if (studioA !== studioB) {
        return studioA - studioB;
      }

      return a.data.localeCompare(b.data);
    });
  }, [filteredEvents]);

  /**
   * Meses dropdown
   */
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* HEADER */}
      <div
        className="
          flex flex-col gap-3
          sm:flex-row sm:items-center sm:justify-between
        "
      >

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Agenda Operacional
          </h2>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Visualização mensal das operações
          </p>
        </div>

        {/* SELECT MÊS */}
        <div className="flex items-center gap-2">

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(Number(e.target.value))
            }
            className="
              rounded-xl border border-gray-300
              bg-white px-4 py-2 text-sm
              dark:border-gray-700
              dark:bg-gray-900
              dark:text-white
            "
          >

            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}

          </select>

        </div>

      </div>

      {/* TIMELINE */}
      <CalendarTimeline
        year={selectedYear}
        month={selectedMonth}
        events={sortedEvents}
        viagens={viagens}
        mode={mode}
      />

    </div>
  );
}