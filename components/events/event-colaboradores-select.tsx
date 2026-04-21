'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/input';
import FormField from '@/components/events/form-field';

type Props = {
  selected: string[];
  onChange: (ids: string[]) => void;
};

type Colaborador = {
  id: string;
  username: string;
  cargo?: string;
};

export default function EventColaboradoresSelect({
  selected,
  onChange,
}: Props) {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [search, setSearch] = useState('');

  const fetchColaboradores = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, cargo');

    if (error) {
      console.error(error);
      return;
    }

    setColaboradores(data || []);
  };

  useEffect(() => {
    fetchColaboradores();
  }, []);

  const toggleColaborador = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((c) => c !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const filtered = colaboradores.filter((c) =>
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectedList = filtered.filter((c) =>
    selected.includes(c.id)
  );

  const notSelectedList = filtered.filter((c) =>
    !selected.includes(c.id)
  );

  return (
    <FormField label="Colaboradores">
      <div className="space-y-2">

        <Input
          placeholder="Buscar colaborador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="max-h-48 overflow-y-auto border rounded-lg p-2 space-y-3">

          {selectedList.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Selecionados
              </p>

              {selectedList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleColaborador(c.id)}
                  className="flex items-center justify-between p-2 rounded-md bg-green-50 dark:bg-green-900/20 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked readOnly />
                    <span>{c.username}</span>
                  </div>

                  <span className="text-sm text-gray-500">
                    {c.cargo || '-'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {notSelectedList.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">
                Outros
              </p>

              {notSelectedList.map((c) => (
                <div
                  key={c.id}
                  onClick={() => toggleColaborador(c.id)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={false}
                      readOnly
                    />
                    <span>{c.username}</span>
                  </div>

                  <span className="text-sm text-gray-500">
                    {c.cargo || '-'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {filtered.length === 0 && (
            <p className="text-center text-sm text-gray-500">
              Nenhum colaborador encontrado
            </p>
          )}
        </div>
      </div>
    </FormField>
  );
}
