export type Event = {
  id: string;
  nome: string;
  tipo: string;
  data: string;
  local: string;
  observacoes: string;

  channel?: { sigla: string } | null;

  hasScale: boolean;

  isUserScaled?: boolean;
  isFirstShift?: boolean;

  userShift?: {
    id: string;
    start_time: string;
    end_time: string;
  } | null;

  arrivalTime?: string | null;

  viagem_id?: string | null;

  isTravel?: boolean;
  isTravelBlock?: boolean;

  viagem?: {
    id: string;
    nome: string;
    data_saida: string;
    data_retorno: string;
  };
};
