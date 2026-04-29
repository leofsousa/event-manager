import CalendarDayCell from '@/components/calendar/calendar-day-cell';
import type { Event } from '@/types/type-event';

type Props = {
  year: number;
  month: number;
  eventsByDate: Record<string, Event[]>;
  mode: 'admin' | 'colaborador';
};

interface TravelBlock {
  id: string;
  nome: string;
  startIndex: number;
  endIndex: number;
  startDate: string;
  endDate: string;
}

export default function CalendarGrid({ year, month, eventsByDate, mode }: Props) {
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];

  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  // Mapa de viagens com suas datas e informações
  const viagensMap = new Map<string, { 
    nome: string;
    start: string; 
    end: string;
    startIndex: number;
    endIndex: number;
  }>();

  // Buscar viagens dos eventos com isTravelBlock
  Object.values(eventsByDate).forEach((events) => {
    events.forEach((event) => {
      if (event.isTravelBlock && event.viagem && event.viagem.id) {
        if (!viagensMap.has(event.viagem.id)) {
          const startStr = event.viagem.data_saida;
          const endStr = event.viagem.data_retorno;
          
          // Encontrar índices na grade
          let startIdx = cells.findIndex(d => d && d.toLocaleDateString('en-CA') === startStr);
          let endIdx = cells.findIndex(d => d && d.toLocaleDateString('en-CA') === endStr);
          
          // Se encontrou ambas as datas no mês, usar os índices
          if (startIdx !== -1 && endIdx !== -1) {
            viagensMap.set(event.viagem.id, {
              nome: event.viagem.nome,
              start: startStr,
              end: endStr,
              startIndex: startIdx,
              endIndex: endIdx,
            });
          }
        }
      }
    });
  });

  const travelBlocks = Array.from(viagensMap.values());

  return (
    <div className="overflow-x-auto">
      <div className="relative">
        {/* BLOCOS DE VIAGEM CONTÍNUOS - Grid com posicionamento */}
        <div 
          className="grid gap-2 min-w-[700px] mb-2"
          style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}
        >
          {travelBlocks.map((travel) => {
            return (
              <div
                key={`travel-${travel.startIndex}`}
                className="h-7 bg-purple-400 dark:bg-purple-600 text-white dark:text-white rounded-lg flex items-center px-3 text-xs font-bold overflow-hidden whitespace-nowrap shadow-md"
                style={{
                  gridColumn: `${travel.startIndex + 1} / span ${travel.endIndex - travel.startIndex + 1}`,
                }}
              >
                🚐 {travel.nome}
              </div>
            );
          })}
        </div>

        {/* GRADE DE DIAS */}
        <div className="grid grid-cols-7 gap-2 min-w-[700px]">

          {cells.map((date, index) => {
            if (!date) return <div key={index} />;

            const dateStr = date.toLocaleDateString('en-CA');
            const dayEvents = eventsByDate[dateStr] || [];

            return (
              <CalendarDayCell
                key={index}
                date={date}
                events={dayEvents}
                mode={mode}
              />
            );
          })}

        </div>
      </div>
    </div>
  );
}
