import type { Event } from '@/types/type-event';
import EventCard from '@/components/events/event-card';

type Props = {
  events: Event[];
  mode: 'admin' | 'colaborador';
  onDelete?: (event: Event) => void;
};

export default function TodayEventsSection({ events, mode, onDelete }: Props) {
  const todayLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  if (events.length === 0) {
    return (
      <div className="mb-2 p-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        Nenhum evento hoje · {todayLabel}
      </div>
    );
  }

  return (
    <section className="mb-2">
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        🗓 Hoje · {todayLabel}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            mode={mode}
            onDelete={onDelete ?? (() => {})}
          />
        ))}
      </div>
    </section>
  );
}