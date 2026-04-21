'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import EventColaboradoresSelect from './event-colaboradores-select';

type Shift = {
  id?: string;
  start_time: string;
  end_time: string;
  colaboradores: string[];
};

type Props = {
  shifts: Shift[];
  setShifts: React.Dispatch<React.SetStateAction<Shift[]>>;
};

export default function EventShiftsManager({
  shifts,
  setShifts,
}: Props) {

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
            onChange={(ids) =>
              updateShift(activeIndex, {
                colaboradores: ids,
              })
            }
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
