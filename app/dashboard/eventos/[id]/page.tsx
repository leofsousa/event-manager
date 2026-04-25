'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Input from '@/components/ui/input';
import InputDate from '@/components/ui/input-date';
import Button from '@/components/ui/button';
import FormField from '@/components/events/form-field';
import Select from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

export default function EditEventoPage() {
  const { id } = useParams();
  const router = useRouter();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);

  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);

  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('');
  const [channel, setChannel] = useState('');
  const [data, setData] = useState('');
  const [local, setLocal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  const [travelStart, setTravelStart] = useState('');
  const [travelEnd, setTravelEnd] = useState('');

  const [customLocal, setCustomLocal] = useState('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);

  const isStudio = tipo === 'operacao-estudio';
  const isExternal = tipo === 'externa';

  const studioOptions = [
    { label: 'Estúdio 1', value: 'estudio-1' },
    { label: 'Estúdio 2', value: 'estudio-2' },
    { label: 'Estúdio 3', value: 'estudio-3' },
    { label: 'Estúdio 4', value: 'estudio-4' },
    { label: 'Outro', value: '__other__' },
  ];

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      showToast('Erro ao carregar evento');
      return;
    }

    setNome(data.nome);
    setTipo(data.tipo);
    setData(data.data);
    setLocal(data.local);
    setObservacoes(data.observacoes || '');
    setChannel(data.channel_id || '');

    setTravelStart(data.travel_start_date || '');
    setTravelEnd(data.travel_end_date || '');

    setLoading(false);
  };

  const fetchTypes = async () => {
    const { data } = await supabase.from('event_types').select('*');

    setEventTypes(
      (data || []).map((t: any) => ({
        label: t.label,
        value: t.value,
      }))
    );
  };

  const fetchChannels = async () => {
    const { data } = await supabase.from('channels').select('*');

    setChannels(
      (data || []).map((c: any) => ({
        label: `${c.sigla} - ${c.name}`,
        value: c.id,
      }))
    );
  };

  useEffect(() => {
    fetchEvent();
    fetchTypes();
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!isExternal) {
      setTravelStart('');
      setTravelEnd('');
    }
  }, [tipo]);

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          nome,
          tipo,
          local,
          data,
          observacoes,
          channel_id: channel || null,
          travel_start_date: travelStart || null,
          travel_end_date: travelEnd || null,
        })
        .eq('id', id);

      if (error) throw error;

      showToast('Evento atualizado!');
      router.push('/dashboard/eventos');

    } catch (err) {
      console.error(err);
      showToast('Erro ao atualizar');
    }
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-semibold mb-6">
        Editar Evento
      </h1>

      <div className="flex flex-col gap-4">

        <FormField label="Nome">
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </FormField>

        <FormField label="Tipo">
          <Select value={tipo} options={eventTypes} onChange={setTipo} />
        </FormField>

        <FormField label="Local">
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

        <FormField label="Canal">
          <Select value={channel} options={channels} onChange={setChannel} />
        </FormField>

        <FormField label="Data">
          <InputDate value={data} onChange={setData} />
        </FormField>

        {isExternal && (
          <div className="grid grid-cols-2 gap-2">
            <FormField label="Início viagem">
              <InputDate value={travelStart} onChange={setTravelStart} />
            </FormField>

            <FormField label="Fim viagem">
              <InputDate value={travelEnd} onChange={setTravelEnd} />
            </FormField>
          </div>
        )}

        <FormField label="Observações">
          <textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border
            bg-white text-gray-900 dark:bg-gray-800 dark:border-gray-700
            dark:text-gray-100 focus:outline-none focus:ring-2
            focus:ring-blue-500 border-gray-300 resize-none"
          />
        </FormField>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>

          <Button onClick={handleSubmit}>
            Salvar alterações
          </Button>
        </div>

      </div>
    </div>
  );
}
