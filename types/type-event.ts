export type Event = {
  id: string;
  nome: string;
  tipo: string;
  data: string;
  local: string;
  observacoes: string;
  channel?: string | null;
  hasScale: boolean;
};
