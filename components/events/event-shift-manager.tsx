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
};

export default function EventShiftsManager({
  shifts,
  setShifts,
  eventDate,
  eventId
}: Props) {
  const { showToast } = useToast();

  const toMinutes = (time: string) => {
    if (!time) return 0;
    const parts = time.split(":");
    const h = Number(parts[0] || 0);
    const m = Number(parts[1] || 0);
    return h * 60 + m;
  };

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
  
    const aStartRaw = toMinutes(a.start_time);
    const aEndRaw = toMinutes(a.end_time);
    const bStartRaw = toMinutes(b.start_time);
    const bEndRaw = toMinutes(b.end_time);
  
    const aNorm = normalize(aStartRaw, aEndRaw);
    const bNorm = normalize(bStartRaw, bEndRaw);
  
    const conflict =
      aNorm.start < bNorm.end &&
      aNorm.end > bNorm.start;
  
    console.log("CHECK FINAL:", {
      a: aNorm,
      b: bNorm,
      conflict
    });
  
    return conflict;
  };
  

  const fetchConflicts = async (eventDate: string, eventId?: string) => {
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

    const { data, error } = await query;

    if (error) {
      console.error("Erro ao buscar conflitos:", error);
      return [];
    }

    return data || [];
  };

  const [activeIndex, setActiveIndex] = useState(0);

  const addShift = () => {
    setShifts((prev) => [
      ...prev,
      {
        start_time: '',
        end_time: '',
        colaboradores: [],
      },
    ]);
  };

  const removeShift = (index: number) => {
    setShifts((prev) => prev.filter((_, i) => i !== index));
    setActiveIndex(0);
  };

  const updateShift = (index: number, updated: Partial<Shift>) => {
    setShifts((prev) =>
      prev.map((shift, i) =>
        i === index ? { ...shift, ...updated } : shift
      )
    );
  };

  useEffect(() => {
    if (shifts.length === 0) {
      addShift();
    }
  }, []);

  const currentShift = shifts[activeIndex];

  return (
    <div className="space-y-4">

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
          onClick={() => {
            addShift();
            setActiveIndex(shifts.length);
          }}
          className="px-3 py-1 rounded-lg bg-green-500 text-white"
        >
          +
        </button>
      </div>

      {currentShift && (
        <div className="border rounded-xl p-4 space-y-4">

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

          <EventColaboradoresSelect
            selected={currentShift.colaboradores}
            onChange={async (ids) => {

              const currentShiftUpdated = {
                ...shifts[activeIndex],
                colaboradores: ids
              };

              const events = await fetchConflicts(eventDate, eventId);

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

                    const isSameCollaborator = shift.event_shift_collaborators.some(
                      (c: any) => c.collaborator_id === colabId
                    );

                    if (!isSameCollaborator) continue;

                    const conflict = hasConflict(currentShiftUpdated, shift);

                    console.log({
                      currentShiftUpdated,
                      comparingWith: shift,
                      colabId,
                      conflict
                    });

                    if (conflict) {
                      hasAnyConflict = true;
                    }
                  }
                }
              }

              if (hasAnyConflict) {
                showToast("⚠️ Um ou mais colaboradores já estão em outro evento nesse horário");
              }

              updateShift(activeIndex, {
                colaboradores: ids,
              });
            }}
          />

          {shifts.length > 1 && (
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
