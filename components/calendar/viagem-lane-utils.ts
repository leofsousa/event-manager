export type ViagemInterval = {
  id: string;
  nome: string;
  data_saida: string;
  data_retorno: string;
};

export const TRAVEL_LANE_HEIGHT = 108;

const overlaps = (a: ViagemInterval, b: ViagemInterval) => {
  return a.data_saida <= b.data_retorno && b.data_saida <= a.data_retorno;
};

/** Atribui faixa fixa por viagem para manter continuidade visual no calendário. */
export function assignViagemLanes(viagens: ViagemInterval[]): Map<string, number> {
  const sorted = [...viagens].sort((a, b) => {
    const byStart = a.data_saida.localeCompare(b.data_saida);
    if (byStart !== 0) return byStart;
    return a.data_retorno.localeCompare(b.data_retorno);
  });

  const lanes: ViagemInterval[][] = [];
  const assignment = new Map<string, number>();

  for (const viagem of sorted) {
    let placed = false;

    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex++) {
      const hasConflict = lanes[laneIndex].some((other) => overlaps(other, viagem));

      if (!hasConflict) {
        lanes[laneIndex].push(viagem);
        assignment.set(viagem.id, laneIndex);
        placed = true;
        break;
      }
    }

    if (!placed) {
      assignment.set(viagem.id, lanes.length);
      lanes.push([viagem]);
    }
  }

  return assignment;
}

export function filterViagensInMonth(
  viagens: ViagemInterval[],
  monthStart: string,
  monthEnd: string,
) {
  return viagens.filter(
    (viagem) =>
      viagem.data_saida <= monthEnd && viagem.data_retorno >= monthStart,
  );
}

export function getLaneCount(laneMap: Map<string, number>) {
  if (laneMap.size === 0) return 0;
  return Math.max(...laneMap.values()) + 1;
}
