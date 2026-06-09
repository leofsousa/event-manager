"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/input";
import InputDate from "@/components/ui/input-date";
import Button from "@/components/ui/button";
import FormField from "@/components/events/form-field";
import { useToast } from "@/hooks/useToast";

export default function NovaViagemPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [nome, setNome] = useState("");
  const [local, setLocal] = useState("");
  const [dataSaida, setDataSaida] = useState("");
  const [dataRetorno, setDataRetorno] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState({
    nome: "",
    local: "",
    dataSaida: "",
    dataRetorno: "",
  });

  const validate = () => {
    const newErrors = {
      nome: "",
      local: "",
      dataSaida: "",
      dataRetorno: "",
    };

    if (!nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!local.trim()) {
      newErrors.local = "Local é obrigatório";
    }

    if (!dataSaida) {
      newErrors.dataSaida = "Data de saída é obrigatória";
    }

    if (!dataRetorno) {
      newErrors.dataRetorno = "Data de retorno é obrigatória";
    }

    setErrors(newErrors);

    if (dataSaida && dataRetorno && dataSaida > dataRetorno) {
      showToast("Data de saída não pode ser maior que a de retorno");

      return false;
    }

    return Object.values(newErrors).every((e) => e === "");
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    const { data, error } = await supabase
      .from("viagens")
      .insert([
        {
          nome,
          local,
          data_saida: dataSaida,
          data_retorno: dataRetorno,
          observacoes,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      showToast("Erro ao criar viagem");
      setIsSubmitting(false);
      return;
    }

    showToast("Viagem criada!");
    router.push(`/dashboard/viagens/${data.id}`);
  };

  const isFormValid = nome.trim() && local.trim() && dataSaida && dataRetorno;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
      <div className="mx-auto w-full max-w-4xl p-6 pb-12">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">
          Nova Viagem
        </h1>

        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Nome" htmlFor="nome" required error={errors.nome}>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </FormField>

            <FormField label="Local" htmlFor="local" required error={errors.local}>
              <Input
                id="local"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Data de saída"
              htmlFor="data-saida"
              required
              error={errors.dataSaida}
            >
              <InputDate
                id="data-saida"
                value={dataSaida}
                onChange={setDataSaida}
              />
            </FormField>

            <FormField
              label="Data de retorno"
              htmlFor="data-retorno"
              required
              error={errors.dataRetorno}
            >
              <InputDate
                id="data-retorno"
                value={dataRetorno}
                onChange={setDataRetorno}
              />
            </FormField>
          </div>

          <FormField label="Observações" htmlFor="observacoes" required={false}>
            <textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="
                w-full
                min-h-[120px]
                resize-none
                rounded-lg
                border
                border-gray-300
                bg-white
                px-3
                py-2
                text-gray-900
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                dark:border-gray-700
                dark:bg-gray-800
                dark:text-gray-100
              "
            />
          </FormField>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar e continuar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
