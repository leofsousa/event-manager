'use client';

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
  };

  const updateShift = (index: number, updated: Partial<Shift>) => {
    setShifts((prev) =>
      prev.map((shift, i) =>
        i === index ? { ...shift, ...updated } : shift
      )
    );
  };

  return (
    <div className="space-y-4">

      <p className="font-semibold text-gray-800 dark:text-gray-200">
        Turnos
      </p>

      {shifts.map((shift, index) => (
        <div
          key={index}
          className="border rounded-lg p-3 space-y-3"
        >
          <div className="flex gap-2">
            <Input
              type="time"
              value={shift.start_time}
              onChange={(e) =>
                updateShift(index, { start_time: e.target.value })
              }
            />

            <Input
              type="time"
              value={shift.end_time}
              onChange={(e) =>
                updateShift(index, { end_time: e.target.value })
              }
            />
          </div>

          <EventColaboradoresSelect
            selected={shift.colaboradores}
            onChange={(ids) =>
              updateShift(index, { colaboradores: ids })
            }
          />

          <Button
            variant="danger"
            onClick={() => removeShift(index)}
          >
            Remover turno
          </Button>
        </div>
      ))}

      <Button onClick={addShift}>
        + Adicionar turno
      </Button>
    </div>
  );
}
