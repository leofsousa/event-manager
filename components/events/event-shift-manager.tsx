'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import EventColaboradoresSelect from './event-colaboradores-select';
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

type Shift = {
  id?: string;
  start_time: string;
  end_time: string;
  colaboradores: string[];
};

type Props = {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
  eventDate: string;
  eventId?: string;
  isViagem?: boolean;
};

export default function EventShiftsManager({
  shifts,
  setShifts,
  eventDate,
  eventId,
  isViagem = false
}: Props) {

  const { showToast } = useToast();
  const [activeIndex, setActiveIndex] = useState(0);

  // =========================
  // CONFLICT LOGIC
  // =========================

  const hasConflict = (a: any, b: any) => {
    const toMinutes = (time: string) => {
      if (!time) return 0;
      const [h, m] = time.split(":");
      return Number(h) * 60 + Number(m);
    };

    const normalize = (start: number, end: number) => {
      if (end <= start) {
        return { start, end: end + 1440 };
      }
      return { start, end };
    };

    const aNorm = normalize(toMinutes(a.start_time), toMinutes(a.end_time));
    const bNorm = normalize(toMinutes(b.start_time), toMinutes(b.end_time));

    return (
      aNorm.start < bNorm.end &&
      aNorm.end > bNorm.start
    );
  };

  const fetchConflicts = async () => {
    const normalizedDate = eventDate?.split("T")[0];

    let query = supabase
      .from("events")
      .select(`
        id,
        data,
        event_shifts (
          id,
          start_time,
          end_time,
          event_shift_collaborators (
            collaborator_id
          )
        )
      `)
      .gte("data", normalizedDate + "T00:00:00")
      .lte("data", normalizedDate + "T23:59:59");

    if (eventId) {
      query = query.neq("id", eventId);
    }

    const { data } = await query;
    return data || [];
  };

  // =========================
  // SHIFT CONTROL
  // =========================

  const addShift = () => {
    if (isViagem) return; // 🚫 viagem não pode ter múltiplos turnos

    setShifts(prev => [
      ...prev,
      {
        start_time: '',
        end_time: '',
        colaboradores: [],
      },
    ]);
  };

  const removeShift = (index: number) => {
    if (isViagem) return;

    setShifts(prev => prev.filter((_, i) => i !== index));
    setActiveIndex(0);
  };

  const updateShift = (index: number, updated: Partial<Shift>) => {
    setShifts(prev =>
      prev.map((shift, i) =>
        i === index ? { ...shift, ...updated } : shift
      )
    );
  };

  // =========================
  // INIT
  // =========================

  useEffect(() => {
    if (shifts.length === 0) {
      setShifts([
        {
          start_time: '',
          end_time: '',
          colaboradores: [],
        },
      ]);
    }

    if (isViagem && shifts.length > 1) {
      setShifts([shifts[0]]);
    }
  }, [isViagem]);

  const currentShift = shifts[activeIndex];

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-4">

      {/* TURNOS */}
      {!isViagem && (
        <div className="flex gap-2 flex-wrap">
          {shifts.map((shift, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`px-3 py-1 rounded-lg text-sm transition ${
                activeIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              Turno {index + 1}
              {shift.start_time && shift.end_time && (
                <span className="ml-2 text-xs opacity-80">
                  ({shift.start_time} - {shift.end_time})
                </span>
              )}
            </button>
          ))}

          <button
            onClick={addShift}
            className="px-3 py-1 rounded-lg bg-green-500 text-white"
          >
            +
          </button>
        </div>
      )}

      {/* CARD */}
      {currentShift && (
        <div className="border rounded-xl p-4 space-y-4">

          {/* HORÁRIO */}
          {!isViagem && (
            <div className="flex gap-2">
              <Input
                type="time"
                step={900}
                value={currentShift.start_time}
                onChange={(e) =>
                  updateShift(activeIndex, {
                    start_time: e.target.value,
                  })
                }
              />

              <Input
                type="time"
                value={currentShift.end_time}
                onChange={(e) =>
                  updateShift(activeIndex, {
                    end_time: e.target.value,
                  })
                }
              />
            </div>
          )}

          {/* COLABORADORES */}
          <EventColaboradoresSelect
            selected={currentShift.colaboradores}
            onChange={async (ids) => {

              // 🚀 viagem = sem conflito
              if (isViagem) {
                updateShift(activeIndex, { colaboradores: ids });
                return;
              }

              const currentShiftUpdated = {
                ...currentShift,
                colaboradores: ids
              };

              const events = await fetchConflicts();

              let hasAnyConflict = false;

              for (const colabId of ids) {
                for (const event of events) {
                  for (const shift of event.event_shifts) {

                    if (
                      !currentShiftUpdated.start_time ||
                      !currentShiftUpdated.end_time ||
                      !shift.start_time ||
                      !shift.end_time
                    ) continue;

                    const isSame = shift.event_shift_collaborators.some(
                      (c: any) => c.collaborator_id === colabId
                    );

                    if (!isSame) continue;

                    if (hasConflict(currentShiftUpdated, shift)) {
                      hasAnyConflict = true;
                    }
                  }
                }
              }

              if (hasAnyConflict) {
                showToast("⚠️ Conflito de horário detectado");
              }

              updateShift(activeIndex, {
                colaboradores: ids,
              });
            }}
          />

          {/* REMOVER */}
          {!isViagem && shifts.length > 1 && (
            <div className="flex justify-end">
              <Button
                variant="danger"
                onClick={() => removeShift(activeIndex)}
              >
                Remover turno
              </Button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
