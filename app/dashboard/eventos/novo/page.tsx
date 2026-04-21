'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import InputDate from '@/components/ui/input-date';
import Button from '@/components/ui/button';
import FormField from '@/components/events/form-field';
import Select from '@/components/ui/select';
import CreateOptionModal from '@/components/modals/create-option-modal';
import EventShiftsManager from '@/components/events/event-shift-manager';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

type Shift = {
  start_time: string;
  end_time: string;
  colaboradores: string[];
};

export default function NovoEventoPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [eventTypes, setEventTypes] = useState<{ label: string; value: string }[]>([]);
  const [isCreatingType, setIsCreatingType] = useState(false);

  const [shifts, setShifts] = useState<Shift[]>([]);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [customLocal, setCustomLocal] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const [isSubmiting, setIsSubmiting] = useState(false);

  const [errors, setErrors] = useState({
    nome: '',
    tipo: '',
    data: '',
    local: '',
  });

  const studioOptions = [
    { label: 'Estúdio 1', value: 'estudio-1' },
    { label: 'Estúdio 2', value: 'estudio-2' },
    { label: 'Estúdio 3', value: 'estudio-3' },
    { label: 'Estúdio 4', value: 'estudio-4' },
    { label: 'Outro', value: '__other__' },
  ];

  const isStudio = tipo === 'operacao-estudio';

  const fetchTypes = async () => {
    const { data, error } = await supabase
      .from('event_types')
      .select('*');

    if (error) {
      console.error(error);
      return;
    }

    const formatted = (data || []).map((t: any) => ({
      label: t.label,
      value: t.value,
    }));

    setEventTypes(formatted);
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  useEffect(() => {
    setLocal('');
    setIsOtherSelected(false);
  }, [tipo]);

  const handleCreateType = async (name: string) => {
    const formatted = name.toLowerCase().replace(/\s+/g, '-');

    const { data, error } = await supabase
      .from('event_types')
      .insert([{ label: name, value: formatted }])
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast('Erro ao criar tipo');
      return;
    }

    setEventTypes((prev) => [...prev, data]);
    setTipo(data.value);

    showToast('Tipo criado!');
  };

  const validate = () => {
    const newErrors = {
      nome: '',
      tipo: '',
      data: '',
      local: '',
    };

    if (!nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!tipo.trim()) newErrors.tipo = 'Tipo é obrigatório';
    if (!data.trim()) newErrors.data = 'Data é obrigatória';
    if (!local.trim()) newErrors.local = 'Local é obrigatório';

    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === '');
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmiting(true);

    try {
      const { data: event, error } = await supabase
        .from('events')
        .insert([{
          nome,
          tipo,
          local,
          data,
          observacoes,
        }])
        .select()
        .single();

      if (error) throw error;

      for (const shift of shifts) {
        const { data: newShift } = await supabase
          .from('event_shifts')
          .insert([{
            event_id: event.id,
            start_time: shift.start_time,
            end_time: shift.end_time,
          }])
          .select()
          .single();

        if (shift.colaboradores.length > 0) {
          await supabase.from('event_shift_collaborators').insert(
            shift.colaboradores.map((colabId) => ({
              shift_id: newShift.id,
              collaborator_id: colabId,
            }))
          );
        }
      }

      showToast('Evento criado com sucesso!');
      router.push('/dashboard/eventos');

    } catch (err) {
      console.error(err);
      showToast('Erro ao salvar');
    }

    setIsSubmiting(false);
  };

  const isFormValid =
    nome.trim() &&
    tipo.trim() &&
    data.trim() &&
    local.trim();

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        Novo Evento
      </h1>

      <div className="flex flex-col gap-4">

        <FormField label="Nome" required error={errors.nome}>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </FormField>

        <FormField label="Tipo" required error={errors.tipo}>
          <Select
            value={tipo}
            options={eventTypes}
            showCreateOption
            onChange={(value) => {
              if (value === '__new__') {
                setIsCreatingType(true);
              } else {
                setTipo(value);
              }
            }}
          />
        </FormField>

        <FormField label="Local" required error={errors.local}>
          {isStudio ? (
            <>
              <Select
                value={isOtherSelected ? '__other__' : local}
                options={studioOptions}
                onChange={(value) => {
                  if (value === '__other__') {
                    setIsOtherSelected(true);
                    setLocal('');
                  } else {
                    setIsOtherSelected(false);
                    setLocal(value);
                  }
                }}
              />
              {isOtherSelected && (
                <Input
                  value={customLocal}
                  onChange={(e) => {
                    setCustomLocal(e.target.value);
                    setLocal(e.target.value);
                  }}
                />
              )}
            </>
          ) : (
            <Input value={local} onChange={(e) => setLocal(e.target.value)} />
          )}
        </FormField>

        <FormField label="Data" required error={errors.data}>
          <InputDate value={data} onChange={setData} />
        </FormField>

        <FormField label="Observações">
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border"
          />
        </FormField>

        <EventShiftsManager
          shifts={shifts}
          setShifts={setShifts}
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
          >
            {isSubmiting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>

      </div>

      {isCreatingType && (
        <CreateOptionModal
          title="Novo tipo"
          placeholder="Ex: Convenção"
          onClose={() => setIsCreatingType(false)}
          onCreate={(value) => {
            handleCreateType(value);
            setIsCreatingType(false);
          }}
        />
      )}
    </div>
  );
}
