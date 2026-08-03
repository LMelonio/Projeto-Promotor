import { useQuery } from '@tanstack/react-query';

import { historyRepository } from '@/repositories/implementations/HistoryRepository';

/** Hook de dados do Histórico (Fase 4) — mesmo padrão de `screens/home/useHomeData.ts`. */
export function useVisitHistory(promoterId: string | undefined) {
  return useQuery({
    queryKey: ['history', promoterId],
    queryFn: () => historyRepository.listCompletedVisits(promoterId as string),
    enabled: Boolean(promoterId),
  });
}
